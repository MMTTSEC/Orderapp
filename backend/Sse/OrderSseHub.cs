using System.Collections.Concurrent;
using System.Text.Json;
using System.Threading.Channels;

public record OrderDto(string id, string number, string status);

public class OrderSseHub
{
    public record Client(Guid Id, Channel<string> Channel)
    {
        public ChannelReader<string> Reader => Channel.Reader;
    }

    private readonly ConcurrentDictionary<Guid, Client> _clients = new();
    private string? _latestSnapshotJson;

    public Client Connect()
    {
        var channel = Channel.CreateUnbounded<string>(new UnboundedChannelOptions
        {
            SingleWriter = false,
            SingleReader = true
        });
        var client = new Client(Guid.NewGuid(), channel);
        _clients[client.Id] = client;
        return client;
    }

    public void Disconnect(Guid id)
    {
        if (_clients.TryRemove(id, out var client))
        {
            client.Channel.Writer.TryComplete();
        }
    }

    public void BroadcastSnapshot(IEnumerable<OrderDto> orders)
    {
        var payload = JsonSerializer.Serialize(new { type = "snapshot", orders });
        _latestSnapshotJson = payload;
        foreach (var c in _clients.Values)
        {
            c.Channel.Writer.TryWrite(payload);
        }
    }

    public bool TryGetLatestSnapshot(out string json)
    {
        if (_latestSnapshotJson is { } s)
        {
            json = s;
            return true;
        }
        json = string.Empty;
        return false;
    }
}


