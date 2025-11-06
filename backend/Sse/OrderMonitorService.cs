using System.Net.Http.Headers;
using System.Text.Json;

public class OrderMonitorService : BackgroundService
{
    private readonly ILogger<OrderMonitorService> _logger;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly OrderSseHub _hub;
    private IReadOnlyDictionary<string, string> _lastStatusByOrder = new Dictionary<string, string>();

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
                var currentStatus = snapshot.ToDictionary(o => o.number, o => o.status);

                if (!DictionariesEqual(_lastStatusByOrder, currentStatus))
                {
                    _hub.BroadcastSnapshot(snapshot);
                    _lastStatusByOrder = currentStatus;
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

    private async Task<List<OrderDto>> FetchOrdersSnapshot(CancellationToken ct)
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
                orders.Add(new OrderDto(id: number!, number: number!, status: status!));
            }
        }

        orders = orders.Where(o => !string.Equals(o.status, "Pending", StringComparison.OrdinalIgnoreCase)).ToList();
        return orders;
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


