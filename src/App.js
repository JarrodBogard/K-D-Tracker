import { useState } from "react";

const initialPlayers = [
  {
    id: 1,
    gamertag: "CallMeMerc",
    kd: 1.5,
    "win/loss": 1.01,
    kdGoal: 1.65,
    matches: [
      { id: 1, map: "Rust", kd: 1.85, result: "loss" },
      { id: 2, map: "Azhir Cave", kd: 0.9, result: "win" },
      { id: 3, map: "Gun Runner", kd: 2.3, result: "win" },
    ],
  },
  {
    id: 2,
    gamertag: "WillKillForTacos",
    kd: 1.05,
    "win/loss": 1.05,
    kdGoal: 1.25,
    matches: [
      { id: 1, map: "Hackney Yard", kd: 1.25, result: "win" },
      { id: 2, map: "Grazna Raid", kd: 0.4, result: "loss" },
      { id: 3, map: "Rust", kd: 0.75, result: "loss" },
    ],
  },
];

function average(arr) {
  return arr.reduce((acc, curr, i, arr) => acc + curr / arr.length, 0);
}

export default function App() {
  const [players, setPlayers] = useState(initialPlayers);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectionType, setSelectionType] = useState(null);
  // merge selectedType and selectedPlayer to enable closing when same button is clicked
  // const [selected, setSelected] = useState({
  //   player: null,
  //   type: null,
  // });

  function handleToggleAddPlayer() {
    setShowAddPlayer((current) => !current);
    setSelectedPlayer(null);
    setSelectionType(null);
  }

  function handleSelection(player, type) {
    // setSelectedPlayer((currentSelectedPlayer) => currentSelectedPlayer?.id !== player.id ? player : null );
    setSelectedPlayer(player);
    setSelectionType(type);
    setShowAddPlayer(false);
  }

  function handleAddPlayer(player) {
    setPlayers((currentPlayers) => [...currentPlayers, player]);
    setShowAddPlayer(false);
  }

  function handleUpdateStats(match) {
    setPlayers((currentPlayers) =>
      currentPlayers.map((player) =>
        player.id === selectedPlayer.id
          ? { ...player, matches: [...player.matches, match] }
          : player
      )
    );
  }

  return (
    <main>
      <PlayerMenu
        players={players}
        selectedPlayer={selectedPlayer}
        showAddPlayer={showAddPlayer}
        selectionType={selectionType}
        onToggleAddPlayer={handleToggleAddPlayer}
        onAddPlayer={handleAddPlayer}
        onSelection={handleSelection}
      />
      {selectedPlayer && selectionType === "view" && (
        <PlayerStats selectedPlayer={selectedPlayer} />
      )}

      {selectedPlayer && selectionType === "update" && (
        <UpdatePlayerStatsForm
          selectedPlayer={selectedPlayer}
          onUpdateStats={handleUpdateStats}
        />
      )}
    </main>
  );
}

function PlayerMenu({
  players,
  selectedPlayer,
  showAddPlayer,
  selectionType,
  onToggleAddPlayer,
  onAddPlayer,
  onSelection,
}) {
  // const avgKD = average(players.map(player => player.matches))

  return (
    <div>
      <ul>
        {players.map((player) => (
          <Player
            key={player.id}
            player={player}
            selectedPlayer={selectedPlayer}
            selectionType={selectionType}
            onSelection={onSelection}
          />
        ))}
      </ul>
      {showAddPlayer && <AddPlayerForm onAddPlayer={onAddPlayer} />}
      <button onClick={onToggleAddPlayer}>
        {showAddPlayer ? "Close" : "Add Player"}
      </button>
    </div>
  );
}

function Player({ player, selectedPlayer, selectionType, onSelection }) {
  const isSelected = player.id === selectedPlayer?.id;

  const avgKD = average(player.matches.map((match) => match.kd)).toFixed(2);

  const avgWinLoss = average(
    player.matches.map((match) => (match.result === "win" ? 1 : -1) + 1)
  ).toFixed(2);

  return (
    <li style={isSelected ? { backgroundColor: "lightyellow" } : {}}>
      <h3>{player.gamertag}</h3>
      <p>Avg K/D Ratio: {avgKD}</p>
      <p>Avg Win/Loss Ratio: {avgWinLoss}</p>
      <p>
        K/D Goal:
        <em
          style={
            avgKD > player.kdGoal
              ? { color: "green" }
              : avgKD < player.kdGoal
              ? { color: "red" }
              : {}
          }
        >
          {player.kdGoal}
        </em>
      </p>
      <div>
        <button onClick={() => onSelection(player, "view")}>
          {isSelected && selectionType === "view" ? "Close View" : "View Stats"}
        </button>
        <button onClick={() => onSelection(player, "update")}>
          {isSelected && selectionType === "update"
            ? "Close Update"
            : "Update Stats"}
        </button>
        <button>Edit Profile</button>
      </div>
    </li>
  );
}

function AddPlayerForm({ onAddPlayer }) {
  // isSelected variable if true then update player else add new player
  const [name, setName] = useState("");
  const [img, setImg] = useState("https://i.pravatar.cc/48");
  const [goal, setGoal] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (!name || !goal || isNaN(goal)) return;

    const id = crypto.randomUUID();

    const newPlayer = {
      id,
      kd: 0,
      "win/loss": 0,
      gamertag: name,
      img: `${img}?=${id}`,
      kdGoal: goal,
      matches: [],
    };

    onAddPlayer(newPlayer);

    setName("");
    setImg("https://i.pravatar.cc/48");
    setGoal("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Player name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter name of player..."
        />
      </div>
      <div>
        <label>Player image url</label>
        <input
          type="text"
          value={img}
          onChange={(e) => setImg(e.target.value)}
          placeholder="Enter image url..."
        />
      </div>
      <div>
        <label>Kill/Death Goal</label>
        <input
          type="number"
          min="0"
          step=".01"
          value={goal}
          onChange={(e) => setGoal(Number(e.target.value))}
          placeholder="Enter a kd goal (e.g. 1.25, 1.5, etc)..."
        />
      </div>
      <button>Add</button>
    </form>
  );
}

function PlayerStats({ selectedPlayer }) {
  return (
    <section>
      <h3>{selectedPlayer.gamertag}</h3>
      <h4>Recent Matches</h4>
      <ul>
        {selectedPlayer.matches.map((match, index) => (
          <Match key={match.id} match={match} />
        ))}
      </ul>
    </section>
  );
}

function Match({ match }) {
  return (
    <li>
      <h5>{match.map}</h5>
      <span>{match.kd}</span>
      <span>{match.result}</span>
    </li>
  );
}

function UpdatePlayerStatsForm({ selectedPlayer, onUpdateStats }) {
  const [map, setMap] = useState("");
  const [kd, setKD] = useState("");
  const [winLoss, setWinLoss] = useState("win");

  function handleSubmit(e) {
    e.preventDefault();

    if (!map || !kd || isNaN(kd)) return;

    const id = crypto.randomUUID();

    const newMatch = {
      id,
      map,
      kd,
      result: winLoss,
    };

    onUpdateStats(newMatch);
    setMap("");
    setKD("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>{selectedPlayer.gamertag}</h3>
      <label>Map</label>
      <input type="text" value={map} onChange={(e) => setMap(e.target.value)} />
      <label>K/D</label>
      <input
        type="number"
        min="0"
        step=".01"
        value={kd}
        onChange={(e) => setKD(Number(e.target.value))}
      />
      <label>Win or Loss?</label>
      <select value={winLoss} onChange={(e) => setWinLoss(e.target.value)}>
        <option value="win">Win</option>
        <option value="loss">Loss</option>
      </select>
      <button>Update</button>
    </form>
  );
}

// function EditPlayerForm() {}
