import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../../lib/db";
import useRealtime from "../../hooks/useRealtime";
import NavBar from "../../components/NavBar";
import AnimCounter from "../../components/AnimCounter";
import Toast from "../../components/Toast";
import Spinner from "../../components/Spinner";
import ConfirmModal from "../../components/ConfirmModal";

const STARTING_BALANCE = 1000;

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [teams, setTeams] = useState([]);
  const [items, setItems] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  // Assign form
  const [selTeam, setSelTeam] = useState("");
  const [selItem, setSelItem] = useState("");
  const [cost, setCost] = useState("");
  const [assigning, setAssigning] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);

  // Search
  const [search, setSearch] = useState("");

  // Undo purchase
  const [undoTarget, setUndoTarget] = useState(null); // { id, teamId, cost, itemName }
  const [undoing, setUndoing] = useState(false);

  const showToast = (msg, color = "#00F5FF") => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    const [{ data: t }, { data: i }, { data: p }] = await Promise.all([
      db.getTeams(),
      db.getItems(),
      db.getPurchases(),
    ]);
    if (t) setTeams(t);
    if (i) setItems(i);
    if (p) setPurchases(p);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useRealtime(
    "purchases",
    null,
    useCallback(() => load(), [load]),
  );
  useRealtime(
    "teams",
    null,
    useCallback(() => load(), [load]),
  );

  // Derived
  const selectedTeam = teams.find((t) => t.id === selTeam);
  const selectedItem = items.find((i) => i.id === selItem);
  const costNum = Number(cost);
  const newBalance = selectedTeam
    ? selectedTeam.currency_balance - costNum
    : null;

  const avgBalance = teams.length
    ? Math.round(
        teams.reduce((s, t) => s + (t.currency_balance ?? 0), 0) / teams.length,
      )
    : 0;

  const stats = [
    { label: "Total Teams", value: teams.length },
    { label: "Total Items", value: items.length },
    { label: "Total Purchases", value: purchases.length },
    { label: "Avg Balance", value: avgBalance },
  ];

  const validate = () => {
    if (!selTeam) return "Select a team.";
    if (!selItem) return "Select an item.";
    if (!costNum || costNum <= 0) return "Enter a valid cost.";
    if (costNum > selectedTeam.currency_balance)
      return "Cost exceeds team balance.";
    return null;
  };

  const handleAssign = async () => {
    const err = validate();
    if (err) return showToast(err, "#FF6B6B");

    setAssigning(true);
    const { error } = await db.assignItem(selTeam, selItem, costNum);
    setAssigning(false);

    if (error) {
      showToast("Assignment failed: " + error.message, "#FF6B6B");
    } else {
      showToast(
        `✅ ${selectedItem.item_name} assigned to ${selectedTeam.team_name}!`,
        "#34D399",
      );
      setSelTeam("");
      setSelItem("");
      setCost("");
    }
  };

  const filteredTeams = teams.filter((t) =>
    t.team_name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleUndo = async () => {
    if (!undoTarget) return;
    setUndoing(true);
    const { error } = await db.undoPurchase(undoTarget.id, undoTarget.teamId, undoTarget.cost);
    setUndoing(false);
    setUndoTarget(null);
    if (error) {
      showToast("Undo failed: " + error.message, "#FF6B6B");
    } else {
      showToast(`↩ ${undoTarget.itemName} removed · +${undoTarget.cost} 🪙 refunded`, "#FCD34D");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner label="Loading admin panel…" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      <div className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 flex flex-col gap-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <span className="text-xs font-semibold tracking-widest uppercase text-purple-400 border border-purple-500/30 rounded-full px-3 py-1">
              Admin
            </span>
            <h1 className="text-3xl font-bold text-white mt-2">
              Auction Control
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate('/admin/teams')}
              className="px-3 py-2 rounded-xl border border-white/10 text-slate-300 hover:border-white/25 text-xs transition-colors"
            >
              👥 Manage Teams
            </button>
            <button
              onClick={() => navigate('/admin/results')}
              className="px-3 py-2 rounded-xl border border-white/10 text-slate-300 hover:border-white/25 text-xs transition-colors"
            >
              ✏️ Update Results
            </button>
            <button
              onClick={() => navigate('/leaderboard')}
              className="px-3 py-2 rounded-xl border border-white/10 text-slate-300 hover:border-white/25 text-xs transition-colors"
            >
              📊 Leaderboard
            </button>
            <button
              onClick={() => navigate('/admin/reset')}
              className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs transition-colors"
            >
              🔥 System Reset
            </button>
            <button
              onClick={() => navigate('/winner')}
              className="px-3 py-2 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 hover:bg-amber-400/20 text-xs transition-colors"
            >
              🏆 Declare Winner
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-col gap-1"
            >
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className="text-2xl font-bold text-cyan-400">
                <AnimCounter value={s.value} />
              </p>
            </div>
          ))}
        </motion.div>

        {/* Assign panel */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.16 }}
          className="rounded-2xl border border-cyan-500/30 bg-white/[0.03] p-6 flex flex-col gap-4 shadow-lg shadow-cyan-500/5"
        >
          <p className="text-sm font-semibold text-slate-200">
            Assign Resource
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Team select */}
            <select
              value={selTeam}
              onChange={(e) => setSelTeam(e.target.value)}
              className="rounded-xl bg-slate-900 border border-white/10 px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500/50 transition-colors"
            >
              <option value="">Select team…</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.team_name} ({t.currency_balance} coins)
                </option>
              ))}
            </select>

            {/* Item select */}
            <select
              value={selItem}
              onChange={(e) => {
                setSelItem(e.target.value);
                const item = items.find((i) => i.id === e.target.value);
                if (item?.base_cost) setCost(String(item.base_cost));
              }}
              className="rounded-xl bg-slate-900 border border-white/10 px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500/50 transition-colors"
            >
              <option value="">Select item…</option>
              {items.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.item_name} [{i.category}]
                </option>
              ))}
            </select>

            {/* Cost input */}
            <input
              type="number"
              min={1}
              placeholder={
                selectedItem ? `Base: ${selectedItem.base_cost}` : "Final cost"
              }
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
          </div>

          {/* Preview */}
          {selectedTeam && selectedItem && costNum > 0 && (
            <p className="text-xs text-slate-400">
              <span style={{ color: selectedTeam.color ?? "#00F5FF" }}>
                {selectedTeam.team_name}
              </span>{" "}
              will receive{" "}
              <span className="text-slate-200">{selectedItem.item_name}</span>{" "}
              for <span className="text-amber-300">{costNum} coins</span> → new
              balance:{" "}
              <span
                className={newBalance < 0 ? "text-red-400" : "text-cyan-400"}
              >
                {newBalance}
              </span>
            </p>
          )}

          <button
            onClick={handleAssign}
            disabled={assigning}
            className="self-start px-6 py-2.5 rounded-xl bg-cyan-400 text-[#050A14] font-semibold text-sm hover:bg-cyan-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {assigning ? "Assigning…" : "Confirm Assignment"}
          </button>
        </motion.div>

        {/* Team overview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.24 }}
          className="flex flex-col gap-4"
        >
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-semibold text-slate-200">
              Team Overview
            </p>
            <input
              type="text"
              placeholder="Search teams…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors w-48"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeams.map((t) => {
              const spent = STARTING_BALANCE - t.currency_balance;
              const pct = Math.min(
                100,
                Math.round((spent / STARTING_BALANCE) * 100),
              );
              const teamPurchases = purchases.filter((p) => p.team_id === t.id);
              return (
                <div
                  key={t.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <p
                      className="font-bold text-sm"
                      style={{ color: t.color ?? "#00F5FF" }}
                    >
                      {t.team_name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {teamPurchases.length} items
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <p className="text-xl font-bold text-cyan-400">
                      {t.currency_balance}
                    </p>
                    <p className="text-xs text-slate-500">coins left</p>
                  </div>

                  {/* Balance bar */}
                  <div className="w-full h-1.5 rounded-full bg-white/10">
                    <div
                      className="h-1.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: t.color ?? "#00F5FF",
                      }}
                    />
                  </div>

                  {/* Purchase rows */}
                  {teamPurchases.length > 0 && (
                    <div className="flex flex-col gap-1.5 mt-1">
                      {teamPurchases.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg"
                          style={{ background: 'rgba(255,255,255,0.03)' }}
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-slate-500 shrink-0">
                              {p.items?.category}
                            </span>
                            <span className="text-xs text-slate-300 truncate">{p.items?.item_name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-xs text-amber-400">−{p.cost} 🪙</span>
                            <button
                              onClick={() => setUndoTarget({ id: p.id, teamId: t.id, cost: p.cost, itemName: p.items?.item_name })}
                              style={{ fontSize: 11, padding: '3px 10px' }}
                              className="rounded bg-red-500/15 border border-red-500/25 text-red-400 hover:bg-red-500/25 transition-colors"
                            >
                              ↩ Undo
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast msg={toast.msg} color={toast.color} />}
      </AnimatePresence>

      <ConfirmModal
        open={!!undoTarget}
        title="Undo Purchase?"
        message={undoTarget ? `This will remove "${undoTarget.itemName}" and refund ${undoTarget.cost} coins back to the team.` : ''}
        confirmLabel={undoing ? 'Undoing…' : 'Yes, Undo'}
        onConfirm={handleUndo}
        onCancel={() => setUndoTarget(null)}
      />
    </div>
  );
}
