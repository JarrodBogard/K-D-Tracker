import { useState } from "react";

const initialPlayers = [
  {
    id: 1,
    gamertag: "CallMeMerc",
    image: "https://i.pravatar.cc/48?u=118836",
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
    image: "https://i.pravatar.cc/48?u=933372",
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
  const [selected, setSelected] = useState(null);

  function handleToggleAddPlayer() {
    setShowAddPlayer((current) => !current);
    setSelected(null);
  }

  function handleSelection(player, type) {
    setSelected((selected) =>
      selected?.player?.id !== player.id || selected?.type !== type
        ? { player, type }
        : null
    );
    setShowAddPlayer(false);
  }

  function handleAddPlayer(player) {
    setPlayers((currentPlayers) => [...currentPlayers, player]);
    setShowAddPlayer(false);
  }

  function handleEditPlayer(player) {
    setPlayers((currentPlayers) =>
      currentPlayers.map((currPlayer) =>
        currPlayer.id === player.id ? { ...player } : currPlayer
      )
    );
    setSelected(null);
  }

  function handleUpdateStats(match) {
    setPlayers((currentPlayers) =>
      currentPlayers.map((currPlayer) =>
        currPlayer.id === selected.player.id
          ? { ...currPlayer, matches: [...currPlayer.matches, match] }
          : currPlayer
      )
    );
    setSelected(null);
  }

  return (
    <main className="app">
      <PlayerMenu
        players={players}
        selectedPlayer={selected?.player}
        showAddPlayer={showAddPlayer}
        selectionType={selected?.type}
        onToggleAddPlayer={handleToggleAddPlayer}
        onAddPlayer={handleAddPlayer}
        onEditPlayer={handleEditPlayer}
        onSelection={handleSelection}
      />
      {selected?.player && selected?.type === "view" && (
        <PlayerStats selectedPlayer={selected.player} />
      )}

      {selected?.player && selected?.type === "update" && (
        <UpdatePlayerStatsForm
          selectedPlayer={selected?.player}
          onToggleAddPlayer={handleToggleAddPlayer}
          onUpdateStats={handleUpdateStats}
        />
      )}

      {(showAddPlayer || selected?.type === "edit") && (
        <Form
          onToggleAddPlayer={handleToggleAddPlayer}
          onAddPlayer={handleAddPlayer}
          onEditPlayer={handleEditPlayer}
          selectedPlayer={selected?.player}
          key={selected?.player?.id}
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
  onSelection,
}) {
  return (
    <div className="menu">
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
      {!showAddPlayer ? (
        <Button
          style={{ marginTop: ".6rem" }}
          className="dark-button"
          onClick={onToggleAddPlayer}
        >
          {showAddPlayer ? "Close" : "Add Player"}
        </Button>
      ) : null}
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
    // <li className={isSelected ? { backgroundColor: "lightyellow" } : {}}>
    <li className={isSelected ? "selected" : ""}>
      <img src={player.image} alt={player.gamertag} />
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
        <Button
          className="dark-button"
          onClick={() => onSelection(player, "view")}
        >
          {isSelected && selectionType === "view" ? "Close View" : "View Stats"}
        </Button>
        <Button
          className="dark-button"
          onClick={() => onSelection(player, "update")}
        >
          {isSelected && selectionType === "update"
            ? "Close Update"
            : "Update Stats"}
        </Button>
        <Button
          className="dark-button"
          onClick={() => onSelection(player, "edit")}
        >
          {isSelected && selectionType === "edit"
            ? "Close Edit"
            : "Edit Profile"}
        </Button>
      </div>
    </li>
  );
}

function Form({
  selectedPlayer,
  onToggleAddPlayer,
  onAddPlayer,
  onEditPlayer,
}) {
  // isSelected variable if true then update player else add new player

  const [name, setName] = useState(selectedPlayer?.gamertag || "");
  const [img, setImg] = useState(
    selectedPlayer?.img || "https://i.pravatar.cc/48"
  );
  const [goal, setGoal] = useState(selectedPlayer?.kdGoal || "");

  function handleSubmit(e) {
    e.preventDefault();

    if (selectedPlayer) {
      const updatedPlayer = {
        ...selectedPlayer,
        gamertag: name || selectedPlayer.gamertag,
        img: img || selectedPlayer.img,
        kdGoal: goal || selectedPlayer.kdGoal,
      };

      onEditPlayer(updatedPlayer);
      return;
    } else {
      if (!name || !goal || isNaN(goal)) return;

      const id = crypto.randomUUID();

      const newPlayer = {
        id,
        kd: 0,
        "win/loss": 0,
        gamertag: name,
        image: `${img}?=${id}`,
        kdGoal: goal,
        matches: [],
      };

      onAddPlayer(newPlayer);
    }

    setName("");
    setImg("https://i.pravatar.cc/48");
    setGoal("");
  }

  return (
    <form className="form-add-friend" onSubmit={handleSubmit}>
      <label>Player name</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter name of player..."
      />

      <label>Player image url</label>
      <input
        type="text"
        value={img}
        onChange={(e) => setImg(e.target.value)}
        placeholder="Enter image url..."
      />

      <label>Kill/Death Goal</label>
      <input
        type="number"
        min="0"
        step=".01"
        value={goal}
        onChange={(e) => setGoal(Number(e.target.value))}
        placeholder="Enter a kd goal (e.g. 1.25, 1.5, etc)..."
      />

      <Button className="dark-button">
        {selectedPlayer ? "Edit Player" : "Add Player"}
      </Button>
      <Button className="dark-button" onClick={onToggleAddPlayer}>
        Close
      </Button>
    </form>
  );
}

function PlayerStats({ selectedPlayer }) {
  return (
    <section style={{ fontSize: "2rem" }}>
      <h3>{selectedPlayer.gamertag}</h3>
      <h4>Recent Matches</h4>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: ".6rem",
          paddingLeft: "0",
        }}
      >
        <span>Map</span>
        <span>K/D</span>
        <span>Result</span>
      </div>
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
    <li
      style={{
        display: "flex",
        paddingLeft: "0",
        justifyContent: "space-between",
      }}
    >
      <h5 style={{ width: "25px" }}>{match.map}</h5>
      <span>{match.kd}</span>
      <span>{match.result}</span>
    </li>
  );
}

function UpdatePlayerStatsForm({ onToggleAddPlayer, onUpdateStats }) {
  const [map, setMap] = useState("Afghan");
  const [kd, setKD] = useState("");
  const [winLoss, setWinLoss] = useState("win");

  function handleSubmit(e) {
    e.preventDefault();
    // console.log("fire");

    if (!map || !kd || isNaN(kd)) return;
    console.log("fire");

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
    <form className="form-add-friend" onSubmit={handleSubmit}>
      {/* <h3>{selectedPlayer.gamertag}</h3> */}
      <label>Map</label>
      <select
        style={{ textAlign: "left" }}
        value={map}
        onChange={(e) => setMap(e.target.value)}
      >
        <option value="Afghan">Afghan</option>
        <option value="Alley">Alley</option>
        <option value="Blacksite">Blacksite</option>
        <option value="Crown Raceway">Crown Raceway</option>
        <option value="Das House">Das House</option>
        <option value="Departures">Departures</option>
        <option value="Derail">Derail</option>
        <option value="Dome">Dome</option>
        <option value="Estate">Estate</option>
        <option value="Exhibit">Exhibit</option>
        <option value="Farm 18">Farm 18</option>
        <option value="Favela">Favela</option>
        <option value="Greece">Greece</option>
        <option value="Highrise">Highrise</option>
        <option value="Invasion">Invasion</option>
        <option value="Karachi">Karachi</option>
        <option value="Las Almas">Las Almas</option>
        <option value="Levin Resort">Levin Resort</option>
        <option value="Meat">Meat</option>
        <option value="Orlov Military Base">Orlov Military Base</option>
        <option value="Popov Power">Popov Power</option>
        <option value="Quarry">Quarry</option>
        <option value="Rio">Rio</option>
        <option value="Rundown">Rundown</option>
        <option value="Rust">Rust</option>
        <option value="Scrapyard">Scrapyard</option>
        <option value="Shipment">Shipment</option>
        <option value="Shoot House">Shoot House</option>
        <option value="Skidrow">Skidrow</option>
        <option value="Stash House">Stash House</option>
        <option value="Sub Base">Sub Base</option>
        <option value="Terminal">Terminal</option>
        <option value="Underpass">Underpass</option>
        <option value="Vista">Vista</option>
        <option value="Wasteland">Wasteland</option>
      </select>
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
      <Button className="dark-button">Update</Button>
      <Button className="dark-button" onClick={onToggleAddPlayer}>
        Close
      </Button>
    </form>
  );
}

function Button({ children, className, style, onClick }) {
  return (
    <button
      style={style ? style : {}}
      className={`button ${className ? className : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
