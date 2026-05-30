import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const HABITS = [
  { id: "wake", label: "Wake up at 6AM", emoji: "🌅" },
  { id: "cold", label: "Cold Shower", emoji: "🚿" },
  { id: "read", label: "Read", emoji: "📖" },
  { id: "plan", label: "Plan / Schedule", emoji: "📋" },
  { id: "sleep", label: "Sleep Early", emoji: "🌙" },
  { id: "run", label: "Running", emoji: "🏃" },
];

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS_OF_WEEK = ["S","M","T","W","T","F","S"];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export default function HabitTracker() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [data, setData] = useState({});
  const [view, setView] = useState("grid"); // grid | chart

  useEffect(() => {
    const saved = localStorage.getItem("habitData");
    if (saved) setData(JSON.parse(saved));
  }, []);

  const save = (newData) => {
    setData(newData);
    localStorage.setItem("habitData", JSON.stringify(newData));
  };

  const toggle = (day, habitId) => {
    const key = `${year}-${month}-${day}-${habitId}`;
    const next = { ...data, [key]: !data[key] };
    save(next);
  };

  const isChecked = (day, habitId) => !!data[`${year}-${month}-${day}-${habitId}`];

  const isToday = (day) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Stats
  const totalPossible = daysInMonth * HABITS.length;
  const completed = HABITS.reduce((acc, h) => {
    for (let d = 1; d <= daysInMonth; d++) {
      if (isChecked(d, h.id)) acc++;
    }
    return acc;
  }, 0);
  const pct = Math.round((completed / totalPossible) * 100);

  // Weekly chart data
  const weeks = [];
  let week = 1;
  let weekStart = 1;
  while (weekStart <= daysInMonth) {
    const weekEnd = Math.min(weekStart + 6, daysInMonth);
    let done = 0, total = 0;
    for (let d = weekStart; d <= weekEnd; d++) {
      HABITS.forEach(h => {
        total++;
        if (isChecked(d, h.id)) done++;
      });
    }
    weeks.push({ name: `W${week}`, pct: total ? Math.round((done / total) * 100) : 0, done, total });
    weekStart += 7;
    week++;
  }

  // Per-habit stats
  const habitStats = HABITS.map(h => {
    let done = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      if (isChecked(d, h.id)) done++;
    }
    return { ...h, done, pct: Math.round((done / daysInMonth) * 100) };
  });

  // Daily chart (last 14 days or current month days)
  const dailyData = Array.from({ length: daysInMonth }, (_, i) => {
    const d = i + 1;
    let done = 0;
    HABITS.forEach(h => { if (isChecked(d, h.id)) done++; });
    return { name: `${d}`, pct: Math.round((done / HABITS.length) * 100) };
  });

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const accent = "#f97316";
  const accentLight = "#fff7ed";

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f0f0f",
      color: "#f5f0e8",
      fontFamily: "'Georgia', serif",
      padding: "0",
    }}>
      {/* Header */}
      <div style={{
        background: "#1a1a1a",
        borderBottom: "1px solid #2a2a2a",
        padding: "20px 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 4, color: "#888", textTransform: "uppercase", marginBottom: 4 }}>
            Habit Tracker
          </div>
          <div style={{ fontSize: 26, fontWeight: "bold", color: "#f5f0e8" }}>
            {MONTHS[month]} {year}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={prevMonth} style={navBtn}>‹</button>
          <button onClick={nextMonth} style={navBtn}>›</button>
          <div style={{ width: 1, height: 32, background: "#333", margin: "0 4px" }} />
          <button onClick={() => setView("grid")} style={{ ...tabBtn, ...(view === "grid" ? tabActive : {}) }}>Grid</button>
          <button onClick={() => setView("chart")} style={{ ...tabBtn, ...(view === "chart" ? tabActive : {}) }}>Charts</button>
        </div>
      </div>

      {/* Summary bar */}
      <div style={{
        background: "#161616",
        borderBottom: "1px solid #222",
        padding: "14px 28px",
        display: "flex",
        alignItems: "center",
        gap: 24,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
          <div style={{ fontSize: 13, color: "#888" }}>Monthly Progress</div>
          <div style={{
            flex: 1, maxWidth: 240, height: 6, background: "#2a2a2a", borderRadius: 99, overflow: "hidden"
          }}>
            <div style={{ width: `${pct}%`, height: "100%", background: accent, borderRadius: 99, transition: "width 0.4s" }} />
          </div>
          <div style={{ fontSize: 13, color: accent, fontWeight: "bold" }}>{pct}%</div>
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {[
            { label: "Done", val: completed, color: "#4ade80" },
            { label: "Left", val: totalPossible - completed, color: "#f87171" },
            { label: "Total", val: totalPossible, color: "#888" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: "bold", color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 10, color: "#555", letterSpacing: 2, textTransform: "uppercase" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "24px 28px" }}>

        {view === "grid" ? (
          <div>
            {/* Calendar grid per habit */}
            {HABITS.map(habit => {
              const stat = habitStats.find(h => h.id === habit.id);
              return (
                <div key={habit.id} style={{
                  background: "#1a1a1a",
                  border: "1px solid #252525",
                  borderRadius: 12,
                  padding: "16px 20px",
                  marginBottom: 12,
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 20 }}>{habit.emoji}</span>
                      <span style={{ fontSize: 15, fontWeight: "bold" }}>{habit.label}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 100, height: 5, background: "#2a2a2a", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ width: `${stat.pct}%`, height: "100%", background: stat.pct > 66 ? "#4ade80" : stat.pct > 33 ? accent : "#f87171", borderRadius: 99 }} />
                      </div>
                      <span style={{ fontSize: 12, color: "#888" }}>{stat.done}/{daysInMonth}</span>
                    </div>
                  </div>
                  {/* Day dots */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {/* Offset for first day */}
                    {Array.from({ length: firstDay }).map((_, i) => (
                      <div key={`empty-${i}`} style={{ width: 28, height: 28 }} />
                    ))}
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                      const checked = isChecked(day, habit.id);
                      const tod = isToday(day);
                      return (
                        <button
                          key={day}
                          onClick={() => toggle(day, habit.id)}
                          title={`Day ${day}`}
                          style={{
                            width: 28, height: 28, borderRadius: 6,
                            border: tod ? `2px solid ${accent}` : "1px solid #2d2d2d",
                            background: checked ? accent : "#111",
                            color: checked ? "#fff" : "#444",
                            fontSize: 10,
                            cursor: "pointer",
                            fontFamily: "monospace",
                            transition: "all 0.15s",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                        >
                          {checked ? "✓" : day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Daily chart */}
            <div style={{ background: "#1a1a1a", border: "1px solid #252525", borderRadius: 12, padding: "20px 24px" }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: "#666", textTransform: "uppercase", marginBottom: 16 }}>Daily Completion %</div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={dailyData} barCategoryGap="20%">
                  <XAxis dataKey="name" tick={{ fill: "#555", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: "#555", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                  <Tooltip
                    contentStyle={{ background: "#1e1e1e", border: "1px solid #333", borderRadius: 8, color: "#f5f0e8" }}
                    formatter={(v) => [`${v}%`, "Done"]}
                  />
                  <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
                    {dailyData.map((entry, i) => (
                      <Cell key={i} fill={entry.pct >= 80 ? "#4ade80" : entry.pct >= 50 ? accent : "#f87171"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Weekly chart */}
            <div style={{ background: "#1a1a1a", border: "1px solid #252525", borderRadius: 12, padding: "20px 24px" }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: "#666", textTransform: "uppercase", marginBottom: 16 }}>Weekly Progress</div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={weeks} barCategoryGap="30%">
                  <XAxis dataKey="name" tick={{ fill: "#555", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: "#555", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                  <Tooltip
                    contentStyle={{ background: "#1e1e1e", border: "1px solid #333", borderRadius: 8, color: "#f5f0e8" }}
                    formatter={(v, n, p) => [`${v}% (${p.payload.done}/${p.payload.total})`, "Completion"]}
                  />
                  <Bar dataKey="pct" radius={[6, 6, 0, 0]} fill={accent} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Per-habit bars */}
            <div style={{ background: "#1a1a1a", border: "1px solid #252525", borderRadius: 12, padding: "20px 24px" }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: "#666", textTransform: "uppercase", marginBottom: 20 }}>Habit Breakdown</div>
              {habitStats.map(h => (
                <div key={h.id} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13 }}>{h.emoji} {h.label}</span>
                    <span style={{ fontSize: 13, color: h.pct > 66 ? "#4ade80" : h.pct > 33 ? accent : "#f87171" }}>
                      {h.done}/{daysInMonth} ({h.pct}%)
                    </span>
                  </div>
                  <div style={{ height: 8, background: "#252525", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{
                      width: `${h.pct}%`, height: "100%", borderRadius: 99,
                      background: h.pct > 66 ? "#4ade80" : h.pct > 33 ? accent : "#f87171",
                      transition: "width 0.5s ease",
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const navBtn = {
  background: "#252525",
  border: "1px solid #333",
  color: "#f5f0e8",
  borderRadius: 8,
  width: 36, height: 36,
  fontSize: 18,
  cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
};

const tabBtn = {
  background: "transparent",
  border: "1px solid #333",
  color: "#888",
  borderRadius: 8,
  padding: "6px 14px",
  fontSize: 12,
  cursor: "pointer",
  letterSpacing: 1,
};

const tabActive = {
  background: "#f97316",
  border: "1px solid #f97316",
  color: "#fff",
};
