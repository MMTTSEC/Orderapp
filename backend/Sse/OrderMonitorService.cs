using System.Net.Http.Headers;
using System.Text.Json;

public class OrderMonitorService : BackgroundService
{
    private readonly ILogger<OrderMonitorService> _logger;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly OrderSseHub _hub;
    private IReadOnlyDictionary<string, string> _lastStatusByOrder = new Dictionary<string, string>();
    private ISet<string> _lastPendingCustomerIds = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

    public OrderMonitorService(ILogger<OrderMonitorService> logger, OrderSseHub hub)
    {
        _logger = logger;
        _hub = hub;
        _httpClientFactory = new PooledHttpClientFactory();
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var snapshot = await FetchOrdersSnapshot(stoppingToken);
                var currentStatus = BuildStatusLookup(snapshot.Orders);
                var pendingChanged = !SetsEqual(_lastPendingCustomerIds, snapshot.PendingCustomerIds);

                if (!DictionariesEqual(_lastStatusByOrder, currentStatus) || pendingChanged)
                {
                    _hub.BroadcastSnapshot(snapshot.Orders, snapshot.PendingCustomerIds);
                    _lastStatusByOrder = currentStatus;
                    _lastPendingCustomerIds = new HashSet<string>(snapshot.PendingCustomerIds, StringComparer.OrdinalIgnoreCase);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "OrderMonitorService polling failed");
            }

            await Task.Delay(TimeSpan.FromSeconds(1), stoppingToken);
        }
    }

    private static bool DictionariesEqual(IReadOnlyDictionary<string, string> a, IReadOnlyDictionary<string, string> b)
    {
        if (a.Count != b.Count) return false;
        foreach (var kv in a)
        {
            if (!b.TryGetValue(kv.Key, out var v) || !string.Equals(v, kv.Value, StringComparison.Ordinal)) return false;
        }
        return true;
    }

    private static bool SetsEqual(IEnumerable<string> a, IEnumerable<string> b)
    {
        var setA = new HashSet<string>(a, StringComparer.OrdinalIgnoreCase);
        var setB = new HashSet<string>(b, StringComparer.OrdinalIgnoreCase);
        if (setA.Count != setB.Count) return false;
        foreach (var item in setA)
        {
            if (!setB.Contains(item)) return false;
        }
        return true;
    }

    private sealed record OrdersSnapshot(List<OrderDto> Orders, IReadOnlyCollection<string> PendingCustomerIds);

    private async Task<OrdersSnapshot> FetchOrdersSnapshot(CancellationToken ct)
    {
        var http = _httpClientFactory.CreateClient();
        http.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        var hoTask = http.GetStringAsync("http://localhost:5001/api/raw/HandleOrder", ct);
        var osTask = http.GetStringAsync("http://localhost:5001/api/raw/OrderStatus", ct);
        var coTask = http.GetStringAsync("http://localhost:5001/api/raw/CustomerOrder", ct);
        await Task.WhenAll(hoTask, osTask, coTask);

        var hoList = JsonSerializer.Deserialize<List<JsonElement>>(hoTask.Result) ?? new();
        var osList = JsonSerializer.Deserialize<List<JsonElement>>(osTask.Result) ?? new();
        var coList = JsonSerializer.Deserialize<List<JsonElement>>(coTask.Result) ?? new();

        var statusIdToTitle = osList
            .Select(x => new { id = x.GetProperty("ContentItemId").GetString(), title = x.TryGetProperty("TitlePart", out var tp) && tp.TryGetProperty("Title", out var t) ? t.GetString() : x.TryGetProperty("DisplayText", out var dt) ? dt.GetString() : null })
            .Where(x => x.id != null && x.title != null)
            .ToDictionary(x => x.id!, x => x.title!);

        var customerIdToTitle = coList
            .Select(x => new { id = x.GetProperty("ContentItemId").GetString(), title = x.TryGetProperty("TitlePart", out var tp) && tp.TryGetProperty("Title", out var t) ? t.GetString() : x.TryGetProperty("DisplayText", out var dt) ? dt.GetString() : null })
            .Where(x => x.id != null && x.title != null)
            .ToDictionary(x => x.id!, x => x.title!);

        var orders = new List<OrderDto>();
        var handledCustomerIds = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var ho in hoList)
        {
            var handleOrder = ho.TryGetProperty("HandleOrder", out var hoPart) ? hoPart : default;
            if (handleOrder.ValueKind == JsonValueKind.Undefined) continue;

            string? statusId = null;
            if (handleOrder.TryGetProperty("OrderStatus", out var osPart) && osPart.TryGetProperty("ContentItemIds", out var ids) && ids.ValueKind == JsonValueKind.Array && ids.GetArrayLength() > 0)
            {
                statusId = ids[0].GetString();
            }

            string? coId = null;
            if (handleOrder.TryGetProperty("CustomerOrder", out var coPart) && coPart.TryGetProperty("ContentItemIds", out var cids) && cids.ValueKind == JsonValueKind.Array && cids.GetArrayLength() > 0)
            {
                coId = cids[0].GetString();
            }

            var status = (statusId != null && statusIdToTitle.TryGetValue(statusId, out var st)) ? st : string.Empty;
            var number = (coId != null && customerIdToTitle.TryGetValue(coId, out var nt)) ? nt : (ho.TryGetProperty("TitlePart", out var tp) && tp.TryGetProperty("Title", out var t) ? t.GetString() : ho.TryGetProperty("DisplayText", out var dt) ? dt.GetString() : "");

            if (!string.IsNullOrWhiteSpace(number) && !string.IsNullOrWhiteSpace(status))
            {
                if (!string.IsNullOrWhiteSpace(coId))
                {
                    handledCustomerIds.Add(coId);
                }
                orders.Add(new OrderDto(id: number!, number: number!, status: status!));
            }
        }

        var seenKeys = new HashSet<string>(orders.SelectMany(o => new[] { o.id, o.number }).Where(x => !string.IsNullOrWhiteSpace(x)), StringComparer.OrdinalIgnoreCase);
        var pendingCustomerIds = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var co in coList)
        {
            if (!co.TryGetProperty("ContentItemId", out var coIdProp)) continue;
            var coId = coIdProp.GetString();
            if (string.IsNullOrWhiteSpace(coId)) continue;
            if (handledCustomerIds.Contains(coId)) continue;

            pendingCustomerIds.Add(coId);

            if (seenKeys.Contains(coId))
            {
                continue;
            }

            string? title = null;
            if (co.TryGetProperty("TitlePart", out var tp) && tp.ValueKind == JsonValueKind.Object && tp.TryGetProperty("Title", out var tProp))
            {
                title = tProp.GetString();
            }
            if (string.IsNullOrWhiteSpace(title) && co.TryGetProperty("DisplayText", out var dtProp))
            {
                title = dtProp.GetString();
            }

            if (!string.IsNullOrWhiteSpace(title))
            {
                orders.Add(new OrderDto(id: coId!, number: title!, status: "Pending"));
                seenKeys.Add(coId!);
                seenKeys.Add(title!);
            }
        }

        // Exclude statuses that should not be shown publicly
        orders = orders
            .Where(o =>
                !string.Equals(o.status, "Pending", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(o.status, "Canceled", StringComparison.OrdinalIgnoreCase))
            .ToList();

        return new OrdersSnapshot(orders, pendingCustomerIds);
    }

    private static IReadOnlyDictionary<string, string> BuildStatusLookup(IEnumerable<OrderDto> snapshot)
    {
        var lookup = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

        foreach (var order in snapshot)
        {
            if (string.IsNullOrWhiteSpace(order.number))
            {
                continue;
            }

            // If multiple entries share the same number, keep the latest status encountered
            lookup[order.number] = order.status;
        }

        return lookup;
    }
}

internal sealed class PooledHttpClientFactory : IHttpClientFactory
{
    private readonly HttpClient _client = new HttpClient(new SocketsHttpHandler
    {
        PooledConnectionLifetime = TimeSpan.FromMinutes(5),
        AutomaticDecompression = System.Net.DecompressionMethods.All
    })
    {
        Timeout = TimeSpan.FromSeconds(10)
    };

    public HttpClient CreateClient(string name = "") => _client;
}


