import React, { useState, useEffect } from 'react';

// Инициализация глобального объекта Telegram из окна WebView
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy') => void;
          notificationOccurred: (type: 'success' | 'error') => void;
        };
        BackButton: {
          show: () => void;
          hide: () => void;
          onClick: (cb: () => void) => void;
        };
      };
    };
  }
}

// Глобальные стили на базе CSS-переменных темы Telegram
const styles = {
  container: {
    backgroundColor: 'var(--tg-theme-bg-color, #ffffff)',
    color: 'var(--tg-theme-text-color, #000000)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    minHeight: '100vh',
    padding: '16px',
    paddingBottom: '90px',
    boxSizing: 'border-box' as const,
    userSelect: 'none' as const,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  primaryBtn: {
    width: '100%',
    padding: '14px',
    backgroundColor: 'var(--tg-theme-button-color, #2481cc)',
    color: 'var(--tg-theme-button-text-color, #ffffff)',
    border: 'none',
    borderRadius: '12px',
    fontWeight: 'bold' as const,
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'transform 0.1s ease',
  },
  secondaryBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: 'transparent',
    color: 'var(--tg-theme-link-color, #2481cc)',
    border: '2px solid var(--tg-theme-link-color, #2481cc)',
    borderRadius: '12px',
    fontWeight: 'bold' as const,
    fontSize: '14px',
    cursor: 'pointer',
  },
  card: {
    backgroundColor: 'var(--tg-theme-secondary-bg-color, #f4f5f7)',
    padding: '16px',
    borderRadius: '16px',
    marginBottom: '16px',
  },
  tabBar: {
    position: 'fixed' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: '70px',
    backgroundColor: 'var(--tg-theme-bg-color, #ffffff)',
    borderTop: '1px solid var(--tg-theme-secondary-bg-color, #f4f5f7)',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 'env(safe-area-inset-bottom)',
    zIndex: 1000,
  },
  tabItem: {
    textAlign: 'center' as const,
    cursor: 'pointer',
    fontSize: '12px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  }
};

export default App;

function App() {
  const [activeTab, setActiveTab] = useState<'main' | 'lessons' | 'train' | 'profile'>('main');
  const [activeFilter, setActiveFilter] = useState('Все');
  const [code, setCode] = useState('def square(x):\n    # напиши код тут\n    return x * x');
  const [consoleOutput, setConsoleOutput] = useState('');
  const [serverResult, setServerResult] = useState<{ success: boolean; msg: string } | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentFlashcard, setCurrentFlashcard] = useState(1);

  useEffect(() => {
    // Сигнализируем Telegram, что интерфейс полностью загрузился и готов к рендерингу
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'light') => {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(style);
  };

  const triggerNotificationHaptic = (type: 'success' | 'error') => {
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred(type);
  };

  // Метод отправки кода на бэкенд C#
  const verifyCodeOnBackend = async () => {
    triggerHaptic('medium');
    setConsoleOutput('Компиляция и тестирование кода на сервере...');
    
    try {
      const response = await fetch('http://localhost:5000/api/check-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 777, taskId: 12, code: code })
      });
      const data = await response.json();
      
      if (data.success) {
        triggerNotificationHaptic('success');
        setServerResult({ success: true, msg: data.message });
        setConsoleOutput('> Тесты пройдены успешно!\n> Output: Вывод корректен.');
      } else {
        triggerNotificationHaptic('error');
        setServerResult({ success: false, msg: data.message });
        setConsoleOutput('> Тесты провалены.\n> Output: Ошибка в возвращаемом значении.');
      }
    } catch (err) {
      setConsoleOutput('> Ошибка сети: Не удалось связаться с C# бэкендом.');
      setServerResult({ success: false, msg: 'Сервер недоступен. Проверь запущен ли C# проект!' });
    }
  };

  return (
    <div style={styles.container}>
      
      {/* =======================================================
          ЭКРАН 1: ГЛАВНЫЙ ЭКРАН (DASHBOARD)
      ======================================================= */}
      {activeTab === 'main' && (
        <div>
          <header style={styles.header}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid var(--tg-theme-link-color, #2481cc)', backgroundColor: '#ccc' }} />
              <span style={{ position: 'absolute', bottom: -5, right: -5, backgroundColor: 'var(--tg-theme-link-color, #2481cc)', color: '#fff', fontSize: '10px', padding: '2px 5px', borderRadius: '10px', fontWeight: 'bold' }}>5</span>
            </div>
            <h1 style={{ fontSize: '20px', margin: 0, fontWeight: 800 }}>PySnake 🐍</h1>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <span onClick={() => triggerHaptic()} style={{ fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>🔥 7 дн</span>
              <span onClick={() => triggerHaptic()} style={{ fontSize: '20px', cursor: 'pointer' }}>⚙️</span>
            </div>
          </header>

          {/* Блок статистики */}
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '15px' }}>
            <div style={{ flex: '0 0 120px', backgroundColor: 'var(--tg-theme-secondary-bg-color, #f4f5f7)', padding: '12px', borderRadius: '14px' }}>
              <div style={{ fontSize: '13px', color: 'gray' }}>🏆 Уровень</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', margin: '4px 0' }}>5</div>
              <div style={{ height: '4px', backgroundColor: '#e0e0e0', borderRadius: '2px' }}>
                <div style={{ width: '65%', height: '100%', backgroundColor: 'var(--tg-theme-link-color, #2481cc)', borderRadius: '2px' }} />
              </div>
            </div>
            <div style={{ flex: '0 0 120px', backgroundColor: 'var(--tg-theme-secondary-bg-color, #f4f5f7)', padding: '12px', borderRadius: '14px' }}>
              <div style={{ fontSize: '13px', color: 'gray' }}>⭐ Опыт (XP)</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', margin: '4px 0' }}>1,250</div>
              <div style={{ fontSize: '11px', color: 'gray' }}>цель: 1,500</div>
            </div>
            <div style={{ flex: '0 0 120px', backgroundColor: 'var(--tg-theme-secondary-bg-color, #f4f5f7)', padding: '12px', borderRadius: '14px' }}>
              <div style={{ fontSize: '13px', color: 'gray' }}>📅 Серия</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', margin: '4px 0' }}>7 дней</div>
              <div style={{ fontSize: '11px', color: '#4caf50' }}>Ударный темп!</div>
            </div>
          </div>

          {/* Крупная карточка "Продолжить обучение" */}
          <div style={{ background: 'linear-gradient(135deg, var(--tg-theme-button-color, #2481cc), #1c66a6)', color: '#fff', padding: '20px', borderRadius: '18px', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '18px' }}>Функции в Python</h3>
            <p style={{ margin: '6px 0 16px 0', opacity: 0.9, fontSize: '14px' }}>Изучаем синтаксис оператора def и аргументы.</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
              <span>Пройдено тем</span>
              <span>3 / 10</span>
            </div>
            <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '3px', marginBottom: '20px' }}>
              <div style={{ width: '30%', height: '100%', backgroundColor: '#ffffff', borderRadius: '3px' }} />
            </div>
            <button onClick={() => { triggerHaptic('medium'); setActiveTab('lessons'); }} style={{ ...styles.primaryBtn, backgroundColor: '#ffffff', color: 'var(--tg-theme-button-color, #2481cc)' }}>
              Продолжить
            </button>
          </div>

          {/* Сетка быстрого доступа */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
            {[
              { icon: '📚', label: 'Теория' }, { icon: '💻', label: 'Практика' }, { icon: '🧠', label: 'Тренажёр' },
              { icon: '🏅', label: 'Ачивки' }, { icon: '📊', label: 'Прогресс' }, { icon: '🤖', label: 'ИИ-Помощник' }
            ].map((b, i) => (
              <div key={i} onClick={() => triggerHaptic()} style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color, #f4f5f7)', padding: '14px 8px', borderRadius: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px' }}>{b.icon}</div>
                <div style={{ fontSize: '12px', marginTop: '6px', fontWeight: 500 }}>{b.label}</div>
              </div>
            ))}
          </div>

          {/* Задание дня */}
          <div style={styles.card}>
            <div style={{ fontWeight: 'bold', color: '#ff7043', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>⚡ ЗАДАНИЕ ДНЯ</div>
            <p style={{ margin: '8px 0 14px 0', fontSize: '14px' }}>Напиши функцию, которая принимает два аргумента и возвращает их сумму.</p>
            <button onClick={() => { triggerHaptic('light'); setActiveTab('train'); }} style={styles.secondaryBtn}>Решить задание</button>
          </div>
        </div>
      )}

      {/* =======================================================
          ЭКРАН 2: СПИСОК УРОКОВ
      ======================================================= */}
      {activeTab === 'lessons' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '22px' }}>Все темы</h2>
            <span style={{ fontSize: '20px', cursor: 'pointer' }}>🔍</span>
          </div>

          {/* Скролл фильтров */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '16px' }}>
            {['Все', 'Основы', 'ООП', 'Данные', 'Фреймворки'].map(filter => (
              <button 
                key={filter} 
                onClick={() => { triggerHaptic(); setActiveFilter(filter); }} 
                style={{
                  padding: '8px 16px', borderRadius: '20px', border: 'none',
                  backgroundColor: activeFilter === filter ? 'var(--tg-theme-button-color, #2481cc)' : 'var(--tg-theme-secondary-bg-color, #f4f5f7)',
                  color: activeFilter === filter ? 'var(--tg-theme-button-text-color, #ffffff)' : 'var(--tg-theme-text-color, #000000)',
                  fontWeight: 500, whiteSpace: 'nowrap'
                }}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Список карточек */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { id: 11, title: 'Введение в циклы for и while', type: '📘', status: '✅ Пройдено', sColor: '#4caf50' },
              { id: 12, title: 'Списки и кортежи (Lists & Tuples)', type: '💻', status: '🔄 В процессе', sColor: '#ff9800', p: '50%' },
              { id: 13, title: 'Декораторы и замыкания функций', type: '🎯', status: '🔒 Заблокировано', sColor: '#9e9e9e' }
            ].map(lesson => (
              <div key={lesson.id} style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color, #f4f5f7)', padding: '16px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '70%' }}>
                  <span style={{ fontSize: '20px' }}>{lesson.type}</span>
                  <div style={{ width: '100%' }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Урок {lesson.id}: {lesson.title}</div>
                    {lesson.p && (
                      <div style={{ height: '3px', backgroundColor: '#e0e0e0', borderRadius: '2px', marginTop: '6px', width: '80%' }}>
                        <div style={{ width: lesson.p, height: '100%', backgroundColor: 'var(--tg-theme-link-color, #2481cc)' }} />
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: lesson.sColor }}>{lesson.status}</div>
              </div>
            ))}
          </div>
          
          {/* Рабочая зона урока 12 (Интегрирована прямо в стек для демонстрации) */}
          <div style={{ marginTop: '24px', borderTop: '2px dashed var(--tg-theme-secondary-bg-color, #f4f5f7)', paddingTop: '16px' }}>
            <h3 style={{ margin: '0 0 12px 0' }}>💻 Интерактивная песочница (Урок 12)</h3>
            
            {/* Блок теории */}
            <div style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color, #f4f5f7)', padding: '12px', borderRadius: '12px', marginBottom: '12px' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '13px' }}>Создайте базовую функцию для возведения числа в квадрат.</p>
              <pre style={{ backgroundColor: '#1e1e1e', color: '#a9b7c6', padding: '10px', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace' }}>
                <span style={{ color: '#cc7832' }}>def</span> <span style={{ color: '#ffc66d' }}>square</span>(x):<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#cc7832' }}>return</span> x * x
              </pre>
            </div>

            {/* Поле редактора */}
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={{ width: '100%', height: '110px', backgroundColor: '#1b1b1b', color: '#f8f8f2', fontFamily: 'monospace', padding: '12px', borderRadius: '10px', border: '1px solid #333', boxSizing: 'border-box', fontSize: '13px' }}
            />
            
            <button onClick={verifyCodeOnBackend} style={{ ...styles.primaryBtn, marginTop: '10px' }}>
              ▶️ Отправить на C# сервер
            </button>

            {/* Терминал вывода */}
            {consoleOutput && (
              <pre style={{ backgroundColor: '#000000', color: '#4af626', padding: '12px', borderRadius: '8px', marginTop: '12px', fontSize: '12px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                {consoleOutput}
              </pre>
            )}

            {/* Интерактивный баннер успеха */}
            {serverResult?.success && (
              <div style={{ backgroundColor: '#4caf50', color: '#fff', padding: '14px', borderRadius: '12px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>🎉 <b>{serverResult.msg}</b></div>
                <button onClick={() => setServerResult(null)} style={{ backgroundColor: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', color: '#4caf50', fontWeight: 'bold' }}>Далее</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =======================================================
          ЭКРАН 3: ТРЕНАЖЁР (FLASHCARDS)
      ======================================================= */}
      {activeTab === 'train' && (
        <div>
          {/* Свитчер режимов */}
          <div style={{ display: 'flex', backgroundColor: 'var(--tg-theme-secondary-bg-color, #f4f5f7)', padding: '4px', borderRadius: '10px', marginBottom: '24px' }}>
            <div style={{ flex: 1, textAlign: 'center', padding: '8px', backgroundColor: '#ffffff', borderRadius: '8px', fontWeight: 'bold' }}>Карточки</div>
            <div style={{ flex: 1, textAlign: 'center', padding: '8px', opacity: 0.5 }}>Тесты</div>
            <div style={{ flex: 1, textAlign: 'center', padding: '8px', opacity: 0.5 }}>Баттл</div>
          </div>

          {/* 3D флип-карточка на CSS */}
          <div onClick={() => { triggerHaptic(); setIsFlipped(!isFlipped); }} style={{ perspective: '1000px', width: '100%', height: '200px', marginBottom: '20px' }}>
            <div style={{ width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d', transition: 'transform 0.5s', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
              {/* Лицо */}
              <div style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', backgroundColor: 'var(--tg-theme-secondary-bg-color, #f4f5f7)', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', boxSizing: 'border-box' }}>
                <span style={{ fontSize: '13px', color: 'gray' }}>Карточка {currentFlashcard} из 15</span>
                <p style={{ fontSize: '18px', fontWeight: 'bold', textAlign: 'center', margin: '12px 0' }}>Что возвращает функция, если в ней нет оператора return?</p>
                <span style={{ fontSize: '12px', color: 'var(--tg-theme-link-color, #2481cc)' }}>Тапни, чтобы узнать ответ</span>
              </div>
              {/* Оборот */}
              <div style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', backgroundColor: 'var(--tg-theme-button-color, #2481cc)', color: '#fff', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', transform: 'rotateY(180deg)', boxSizing: 'border-box' }}>
                <p style={{ fontSize: '16px', textAlign: 'center', fontWeight: '500' }}>Функция автоматически возвращает специальный объект типа <b>None</b>.</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => { setIsFlipped(false); setCurrentFlashcard(c => c + 1); triggerHaptic('light'); }} style={{ ...styles.primaryBtn, backgroundColor: '#f44336' }}>❌ Не помню</button>
            <button onClick={() => { setIsFlipped(false); setCurrentFlashcard(c => c + 1); triggerHaptic('light'); }} style={{ ...styles.primaryBtn, backgroundColor: '#4caf50' }}>✅ Знаю</button>
          </div>
        </div>
      )}

      {/* =======================================================
          ЭКРАН 4: ПРОФИЛЬ СТУДЕНТА
      ======================================================= */}
      {activeTab === 'profile' && (
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--tg-theme-secondary-bg-color, #f4f5f7)', border: '3px solid var(--tg-theme-link-color, #2481cc)' }} />
            <h2 style={{ margin: '10px 0 2px 0', fontSize: '20px' }}>@code_explorer</h2>
            <span style={{ fontSize: '14px', color: 'gray' }}>Ученик (Уровень 5)</span>
          </div>

          {/* Счётчики статистики */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <div style={{ flex: 1, backgroundColor: 'var(--tg-theme-secondary-bg-color, #f4f5f7)', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>24</div>
              <div style={{ fontSize: '12px', color: 'gray' }}>уроков пройдено</div>
            </div>
            <div style={{ flex: 1, backgroundColor: 'var(--tg-theme-secondary-bg-color, #f4f5f7)', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>87</div>
              <div style={{ fontSize: '12px', color: 'gray' }}>задач решено</div>
            </div>
          </div>

          {/* Карусель достижений */}
          <h4 style={{ margin: '0 0 10px 0' }}>Награды (Ачивки)</h4>
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
            {['🏅 Первая змейка', '🔥 Спринтер (10 дней)', '🧠 Логик', '🚀 Питонист-Junior'].map((a, i) => (
              <div key={i} style={{ padding: '10px 14px', backgroundColor: 'var(--tg-theme-secondary-bg-color, #f4f5f7)', borderRadius: '20px', whiteSpace: 'nowrap', fontSize: '13px' }}>
                {a}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =======================================================
          НИЖНИЙ TAB BAR (НАВИГАЦИЯ)
      ======================================================= */}
      <nav style={styles.tabBar}>
        <div onClick={() => { triggerHaptic(); setActiveTab('main'); }} style={{ ...styles.tabItem, color: activeTab === 'main' ? 'var(--tg-theme-link-color, #2481cc)' : '#9e9e9e' }}>
          <span style={{ fontSize: '20px' }}>🏠</span>
          <span>Главная</span>
        </div>
        <div onClick={() => { triggerHaptic(); setActiveTab('lessons'); }} style={{ ...styles.tabItem, color: activeTab === 'lessons' ? 'var(--tg-theme-link-color, #2481cc)' : '#9e9e9e' }}>
          <span style={{ fontSize: '20px' }}>📖</span>
          <span>Уроки</span>
        </div>
        <div onClick={() => { triggerHaptic(); setActiveTab('train'); }} style={{ ...styles.tabItem, color: activeTab === 'train' ? 'var(--tg-theme-link-color, #2481cc)' : '#9e9e9e' }}>
          <span style={{ fontSize: '20px' }}>⚡</span>
          <span>Тренажёр</span>
        </div>
        <div onClick={() => { triggerHaptic(); setActiveTab('profile'); }} style={{ ...styles.tabItem, color: activeTab === 'profile' ? 'var(--tg-theme-link-color, #2481cc)' : '#9e9e9e' }}>
          <span style={{ fontSize: '20px' }}>👤</span>
          <span>Профиль</span>
        </div>
      </nav>

    </div>
  );
}