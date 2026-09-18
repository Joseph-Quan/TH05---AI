import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './App.css';

const STORAGE_KEY = 'todos_app_v1';

function TodoInput({ onAddTodo }) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedText = text.trim();

    if (!trimmedText) {
      setError('Vui lòng nhập nội dung công việc.');
      return;
    }

    onAddTodo(trimmedText);
    setText('');
    setError('');
  };

  return (
    <form className="todo-input" onSubmit={handleSubmit} noValidate>
      <label className="sr-only" htmlFor="todo-input">Thêm công việc mới</label>
      <div className="todo-input__row">
        <input
          id="todo-input"
          className="todo-input__field"
          type="text"
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setError('');
          }}
          placeholder="Bạn muốn hoàn thành việc gì?"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'todo-input-error' : undefined}
        />
        <button className="button button--primary" type="submit">Thêm việc</button>
      </div>
      {error && <p className="form-error" id="todo-input-error" role="alert">{error}</p>}
    </form>
  );
}

TodoInput.propTypes = { onAddTodo: PropTypes.func.isRequired };

function FilterBar({ filter, searchQuery, counts, onFilterChange, onSearchChange }) {
  const filters = [
    { value: 'ALL', label: 'Tất cả' },
    { value: 'ACTIVE', label: 'Đang làm' },
    { value: 'COMPLETED', label: 'Đã xong' },
  ];

  return (
    <section className="filter-bar" aria-label="Bộ lọc công việc">
      <div className="filter-bar__tabs" role="group" aria-label="Trạng thái công việc">
        {filters.map((item) => (
          <button
            className={`filter-bar__tab ${filter === item.value ? 'filter-bar__tab--active' : ''}`}
            key={item.value}
            type="button"
            aria-pressed={filter === item.value}
            onClick={() => onFilterChange(item.value)}
          >
            <span>{item.label}</span>
            <span className="filter-bar__count">{counts[item.value]}</span>
          </button>
        ))}
      </div>
      <label className="search-box">
        <span className="search-box__icon" aria-hidden="true">⌕</span>
        <span className="sr-only">Tìm kiếm công việc</span>
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Tìm kiếm..."
        />
      </label>
    </section>
  );
}

FilterBar.propTypes = {
  filter: PropTypes.string.isRequired,
  searchQuery: PropTypes.string.isRequired,
  counts: PropTypes.shape({ ALL: PropTypes.number, ACTIVE: PropTypes.number, COMPLETED: PropTypes.number }).isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onSearchChange: PropTypes.func.isRequired,
};

function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <li className={`todo-item ${todo.completed ? 'todo-item--completed' : ''}`}>
      <button
        className="todo-item__check"
        type="button"
        aria-label={todo.completed ? `Bỏ hoàn thành: ${todo.text}` : `Đánh dấu hoàn thành: ${todo.text}`}
        aria-pressed={todo.completed}
        onClick={() => onToggle(todo.id)}
      >
        {todo.completed ? '✓' : ''}
      </button>
      <span className="todo-item__text">{todo.text}</span>
      <button
        className="todo-item__delete"
        type="button"
        aria-label={`Xóa công việc: ${todo.text}`}
        onClick={() => onDelete(todo.id)}
      >
        ×
      </button>
    </li>
  );
}

TodoItem.propTypes = {
  todo: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    text: PropTypes.string.isRequired,
    completed: PropTypes.bool.isRequired,
    createdAt: PropTypes.string,
  }).isRequired,
  onToggle: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

function TodoList({ todos, onToggle, onDelete }) {
  if (!todos.length) {
    return (
      <div className="empty-state" role="status">
        <span className="empty-state__mark" aria-hidden="true">○</span>
        <h2>Chưa có công việc phù hợp</h2>
        <p>Thêm một việc mới hoặc thay đổi bộ lọc để bắt đầu.</p>
      </div>
    );
  }

  return (
    <ul className="todo-list" aria-label="Danh sách công việc">
      {todos.map((todo) => <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} />)}
    </ul>
  );
}

TodoList.propTypes = {
  todos: PropTypes.arrayOf(PropTypes.object).isRequired,
  onToggle: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

function Stats({ total, completed, active, onClearAll }) {
  const completionRate = total ? Math.round((completed / total) * 100) : 0;

  return (
    <footer className="stats">
      <div className="stats__numbers" aria-label="Thống kê công việc">
        <span><strong>{total}</strong> tổng số</span>
        <span><strong>{active}</strong> đang làm</span>
        <span><strong>{completed}</strong> đã xong</span>
      </div>
      <div className="stats__progress" aria-label={`Đã hoàn thành ${completionRate}%`}>
        <div className="stats__progress-label"><span>Tiến độ</span><strong>{completionRate}%</strong></div>
        <div className="stats__progress-track"><span style={{ width: `${completionRate}%` }} /></div>
      </div>
      <button className="button button--quiet" type="button" onClick={onClearAll} disabled={!total}>
        Xóa tất cả
      </button>
    </footer>
  );
}

Stats.propTypes = {
  total: PropTypes.number.isRequired,
  completed: PropTypes.number.isRequired,
  active: PropTypes.number.isRequired,
  onClearAll: PropTypes.func.isRequired,
};

function loadTodos() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Lỗi tải LocalStorage:', error);
    return [];
  }
}

export default function App() {
  const [todos, setTodos] = useState(loadTodos);
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
      console.error('Lỗi lưu LocalStorage:', error);
    }
  }, [todos]);

  const handleAddTodo = (text) => {
    setTodos((currentTodos) => [{
      id: Date.now(),
      text,
      completed: false,
      createdAt: new Date().toISOString(),
    }, ...currentTodos]);
  };

  const handleToggle = (id) => {
    setTodos((currentTodos) => currentTodos.map((todo) => (
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    )));
  };

  const handleDelete = (id) => {
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id));
  };

  const handleClearAll = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tất cả công việc?')) {
      setTodos([]);
    }
  };

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredTodos = todos.filter((todo) => {
    const matchesFilter = filter === 'ALL'
      || (filter === 'ACTIVE' && !todo.completed)
      || (filter === 'COMPLETED' && todo.completed);
    const matchesSearch = todo.text.toLowerCase().includes(normalizedSearch);
    return matchesFilter && matchesSearch;
  });
  const completed = todos.filter((todo) => todo.completed).length;
  const active = todos.length - completed;
  const filterCounts = { ALL: todos.length, ACTIVE: active, COMPLETED: completed };

  return (
    <main className="app-shell">
      <div className="app-card">
        <header className="app-header">
          <div>
            <p className="app-header__eyebrow">TODO LIST APP</p>
            <h1>Todo List<span>.</span></h1>
            <p className="app-header__subtitle">Sắp xếp công việc, hoàn thành từng bước.</p>
          </div>
          <div className="app-header__date" aria-label="Ngày hiện tại">
            <span className="app-header__dot" aria-hidden="true" />
            Sẵn sàng
          </div>
        </header>

        <TodoInput onAddTodo={handleAddTodo} />
        <FilterBar
          filter={filter}
          searchQuery={searchQuery}
          counts={filterCounts}
          onFilterChange={setFilter}
          onSearchChange={setSearchQuery}
        />
        <TodoList todos={filteredTodos} onToggle={handleToggle} onDelete={handleDelete} />
        <Stats total={todos.length} completed={completed} active={active} onClearAll={handleClearAll} />
      </div>
      <p className="app-shell__hint">Mẹo: nhấn Enter để thêm công việc mới</p>
    </main>
  );
}
