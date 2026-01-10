import { useState } from "react";
import api from "../api/axios";

function Expense() {
  const [group, setGroup] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState("");
  const [amount, setAmount] = useState("");
  const [participants, setParticipants] = useState("");
  const [balances, setBalances] = useState(null);
  const [loading, setLoading] = useState(false);

  const splitEmails = (value) =>
    value
      .split(",")
      .map(v => v.trim().toLowerCase())
      .filter(Boolean);

  const withLoading = async (fn) => {
    try {
      setLoading(true);
      await fn();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* CREATE GROUP */
  const createGroup = () =>
    withLoading(async () => {
      const emails = splitEmails(members);
      if (!groupName || !emails.length) {
        alert("Enter group name and member emails");
        return;
      }

      const res = await api.post("/expense/group", {
        name: groupName,
        members: emails
      });
      setGroup(res.data.group);
    });

  /* ADD EXPENSE */
  const addExpense = () =>
    withLoading(async () => {
      const emails = splitEmails(participants);
      if (!group || !amount || !emails.length) {
        alert("Fill all expense fields");
        return;
      }

      await api.post("/expense/add", {
        groupId: group._id,
        amount: Number(amount),
        participants: emails
      });

      setAmount("");
      setParticipants("");
      alert("Expense added");
    });

  /* LOAD BALANCES */
  const loadBalances = () =>
    withLoading(async () => {
      const res = await api.get(`/expense/balance/${group._id}`);
      setBalances(res.data.balance);
    });

  return (
    <div style={styles.container}>
      <h2>Expense Manager</h2>

      {!group && (
        <Card>
          <h3>Create Group</h3>
          <input
            placeholder="Group Name"
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
          />
          <input
            placeholder="Member Emails (comma separated)"
            value={members}
            onChange={e => setMembers(e.target.value)}
          />
          <button onClick={createGroup} disabled={loading}>
            {loading ? "Creating..." : "Create Group"}
          </button>
        </Card>
      )}

      {group && (
        <>
          <Card>
            <h3>{group.name}</h3>
            <p>Group created successfully</p>
          </Card>

          <Card>
            <h3>Add Expense</h3>
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
            <input
              placeholder="Participant Emails (comma separated)"
              value={participants}
              onChange={e => setParticipants(e.target.value)}
            />
            <button onClick={addExpense} disabled={loading}>
              {loading ? "Adding..." : "Add Expense"}
            </button>
          </Card>

          <Card>
            <h3>Balances</h3>
            <button onClick={loadBalances} disabled={loading}>
              {loading ? "Calculating..." : "Calculate Balances"}
            </button>

            {balances && (
              <ul>
                {Object.entries(balances).map(([name, value]) => (
                  <li key={name}>
                    {name} : ₹ {value}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

/* REUSABLE CARD */
const Card = ({ children }) => (
  <div style={styles.card}>{children}</div>
);

const styles = {
  container: {
    maxWidth: "600px",
    margin: "30px auto"
  },
  card: {
    background: "#fff",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "15px",
    boxShadow: "0 6px 15px rgba(0,0,0,0.08)"
  }
};

export default Expense;
