import { Link } from 'react-router-dom';

const Home = (): JSX.Element => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-3xl space-y-8 text-center">
        <h1 className="bg-gradient-to-r from-primary-300 to-primary-500 bg-clip-text text-6xl font-bold tracking-tight text-transparent">
          Welcome to the Game
        </h1>
        <p className="text-xl text-gray-300">
          Experience an exciting multiplayer board game experience
        </p>

        <div className="flex flex-col items-center gap-4 pt-8">
          <Link
            to="/game"
            className="rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 px-12 py-4 text-xl font-semibold text-white shadow-xl shadow-primary-900/40 transition duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary-900/60"
          >
            Play Game
          </Link>

          <div className="flex gap-4">
            <a
              href="#rules"
              className="rounded-lg px-6 py-2 text-primary-300 transition hover:text-primary-200 hover:underline"
            >
              Rules
            </a>
            <a
              href="#leaderboard"
              className="rounded-lg px-6 py-2 text-primary-300 transition hover:text-primary-200 hover:underline"
            >
              Leaderboard
            </a>
          </div>
        </div>

        <div className="pt-16">
          <div className="rounded-2xl border border-slate-600 bg-background-secondary/50 p-8 backdrop-blur">
            <h2 className="mb-4 text-2xl font-semibold text-white">
              Quick Start
            </h2>
            <ul className="space-y-2 text-left text-gray-300">
              <li className="flex items-start">
                <span className="mr-2 text-primary-400">•</span>
                <span>Click "Play Game" to start or join a game</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-primary-400">•</span>
                <span>Roll the dice and move around the board</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-primary-400">•</span>
                <span>Make strategic decisions to win</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
