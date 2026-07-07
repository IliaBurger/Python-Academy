using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using System.Threading;
using System.Threading.Tasks;
using Telegram.Bot;
using Telegram.Bot.Types;
using Telegram.Bot.Types.ReplyMarkups;

var builder = WebApplication.CreateBuilder(args);

// Настройка CORS для фронтенда Mini App
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

var app = builder.Build();
app.UseCors("AllowAll");

// ====================================================================
// НАСТРОЙКА TELEGRAM БОТА (Новый синтаксис v19+)
// ====================================================================

string botToken = "8927319649:AAGPXIGU3zpirmxf_cJ9R8NUu_oizRryjZo";
string miniAppUrl = "https://your-frontend-domain.com"; // Должен быть HTTPS

var botClient = new TelegramBotClient(botToken);
using var cts = new CancellationTokenSource();

// Запуск прослушивания через встроенный механизм библиотеки
botClient.StartReceiving(
    updateHandler: HandleUpdateAsync,
    errorHandler: HandleErrorAsync,
    cancellationToken: cts.Token
);

// Проверяем подключение к серверу Telegram
var me = await botClient.GetMe();
Console.WriteLine($"[Bot] Бот @{me.Username} успешно запущен и слушает сообщения!");

// Функция обработки входящих обновлений от Telegram
async Task HandleUpdateAsync(ITelegramBotClient bot, Update update, CancellationToken cancellationToken)
{
    if (update.Message is { } message && !string.IsNullOrEmpty(message.Text))
    {
        long chatId = message.Chat.Id;
        Console.WriteLine($"[Bot] Получено сообщение: '{message.Text}' от ChatId: {chatId}");

        if (message.Text.ToLower() == "/start")
        {
            // В новых версиях используется WithWebApp вместо SetWebApp
            var inlineKeyboard = new InlineKeyboardMarkup(new[]
            {
                new[]
                {
                    InlineKeyboardButton.WithWebApp("🐍 Запустить PySnake", new WebAppInfo { Url = miniAppUrl })
                }
            });

            // Нативный метод отправки сообщения в актуальной версии библиотеки
            await bot.SendMessage(
                chatId: chatId,
                text: "Привет! Добро пожаловать в PySnake — интерактивную платформу для изучения Python прямо в Telegram! 🚀\n\nНажми на кнопку ниже, чтобы открыть приложение:",
                replyMarkup: inlineKeyboard,
                cancellationToken: cancellationToken
            );
        }
    }
}

// Функция обработки ошибок сети или токена
Task HandleErrorAsync(ITelegramBotClient bot, Exception exception, CancellationToken cancellationToken)
{
    Console.WriteLine($"[Bot Error] Произошла ошибка: {exception.Message}");
    return Task.CompletedTask;
}

// ====================================================================
// ЭНДПОИНТЫ ДЛЯ ПРОВЕРКИ КОДА (WEB API)
// ====================================================================

app.MapPost("/api/check-task", ([FromBody] TaskSubmission submission) =>
{
    if (submission == null || string.IsNullOrWhiteSpace(submission.Code))
    {
        return Results.BadRequest(new { success = false, message = "Поле с кодом пустое!" });
    }

    string normalizedCode = submission.Code.Replace(" ", "").ToLower();
    bool isSyntaxCorrect = normalizedCode.Contains("defsquare(x):");
    bool hasReturnStatement = normalizedCode.Contains("returnx*x") || normalizedCode.Contains("returnx**2");

    if (isSyntaxCorrect && hasReturnStatement)
    {
        return Results.Ok(new { success = true, message = "Задание решено верно! +50 XP" });
    }
    
    return Results.Ok(new { success = false, message = "Ошибка в коде. Проверь синтаксис или возвращаемое значение." });
});

app.Run("http://localhost:5000");

public class TaskSubmission
{
    public long UserId { get; set; }
    public int TaskId { get; set; }
    public string Code { get; set; } = string.Empty;
}