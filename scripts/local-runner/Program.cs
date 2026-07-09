using System.Diagnostics;
using System.Net;
using System.Net.Sockets;

var noOpen = args.Any(arg => string.Equals(arg, "--no-open", StringComparison.OrdinalIgnoreCase));
var siteRoot = FindSiteRoot(AppContext.BaseDirectory);
if (siteRoot is null)
{
    Console.Error.WriteLine("Could not find package.json next to this launcher or in a parent folder.");
    Console.WriteLine("Move RunWebsite.exe into the Website folder, then run it again.");
    PauseBeforeExit();
    return 1;
}

var npm = FindOnPath("npm.cmd") ?? FindOnPath("npm");
if (npm is null)
{
    Console.Error.WriteLine("Node/npm was not found on PATH. Install Node.js, then run this launcher again.");
    PauseBeforeExit();
    return 1;
}

var nodeModules = Path.Combine(siteRoot, "node_modules");
if (!Directory.Exists(nodeModules))
{
    Console.WriteLine("Installing website dependencies...");
    var installCode = RunProcess(npm, "install", siteRoot);
    if (installCode != 0)
    {
        PauseBeforeExit();
        return installCode;
    }
}

var port = FindFreePort(4321);
var url = $"http://127.0.0.1:{port}/";

Console.Title = "Local Website";
Console.WriteLine("Starting the website locally...");
Console.WriteLine(url);
Console.WriteLine();
Console.WriteLine("Keep this window open while you use the site.");
Console.WriteLine("Press Ctrl+C or close this window to stop it.");
Console.WriteLine();

using var server = StartProcess(npm, $"run dev -- --host 127.0.0.1 --port {port}", siteRoot);
Console.CancelKeyPress += (_, e) =>
{
    e.Cancel = true;
    StopProcess(server);
};

_ = Task.Run(async () =>
{
    if (await WaitForSite(url, TimeSpan.FromSeconds(40)))
    {
        if (!noOpen)
        {
            OpenBrowser(url);
        }
    }
});

server.WaitForExit();
return server.ExitCode;

static string? FindSiteRoot(string startPath)
{
    var directory = new DirectoryInfo(startPath);
    while (directory is not null)
    {
        if (File.Exists(Path.Combine(directory.FullName, "package.json")))
        {
            return directory.FullName;
        }

        directory = directory.Parent;
    }

    return null;
}

static string? FindOnPath(string fileName)
{
    var path = Environment.GetEnvironmentVariable("PATH");
    if (string.IsNullOrWhiteSpace(path))
    {
        return null;
    }

    foreach (var folder in path.Split(Path.PathSeparator, StringSplitOptions.RemoveEmptyEntries))
    {
        var candidate = Path.Combine(folder.Trim(), fileName);
        if (File.Exists(candidate))
        {
            return candidate;
        }
    }

    return null;
}

static int FindFreePort(int preferredPort)
{
    for (var port = preferredPort; port < preferredPort + 100; port++)
    {
        if (IsPortFree(port))
        {
            return port;
        }
    }

    using var listener = new TcpListener(IPAddress.Loopback, 0);
    listener.Start();
    return ((IPEndPoint)listener.LocalEndpoint).Port;
}

static bool IsPortFree(int port)
{
    try
    {
        using var listener = new TcpListener(IPAddress.Loopback, port);
        listener.Start();
        return true;
    }
    catch (SocketException)
    {
        return false;
    }
}

static Process StartProcess(string fileName, string arguments, string workingDirectory)
{
    var process = new Process
    {
        StartInfo = new ProcessStartInfo
        {
            FileName = fileName,
            Arguments = arguments,
            WorkingDirectory = workingDirectory,
            UseShellExecute = false
        }
    };

    process.Start();
    return process;
}

static int RunProcess(string fileName, string arguments, string workingDirectory)
{
    using var process = StartProcess(fileName, arguments, workingDirectory);
    process.WaitForExit();
    return process.ExitCode;
}

static async Task<bool> WaitForSite(string url, TimeSpan timeout)
{
    using var client = new HttpClient();
    var deadline = DateTimeOffset.UtcNow + timeout;

    while (DateTimeOffset.UtcNow < deadline)
    {
        try
        {
            using var response = await client.GetAsync(url);
            if ((int)response.StatusCode < 500)
            {
                return true;
            }
        }
        catch
        {
            await Task.Delay(500);
        }
    }

    return false;
}

static void OpenBrowser(string url)
{
    try
    {
        Process.Start(new ProcessStartInfo
        {
            FileName = url,
            UseShellExecute = true
        });
    }
    catch
    {
        Console.WriteLine($"Open this address in your browser: {url}");
    }
}

static void StopProcess(Process process)
{
    try
    {
        if (!process.HasExited)
        {
            process.Kill(entireProcessTree: true);
        }
    }
    catch
    {
        // The process may already be stopping.
    }
}

static void PauseBeforeExit()
{
    Console.WriteLine();
    Console.WriteLine("Press Enter to close this window.");
    Console.ReadLine();
}
