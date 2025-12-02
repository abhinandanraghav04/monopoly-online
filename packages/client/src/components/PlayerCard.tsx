interface PlayerCardProps {
  name: string;
  balance: number;
  isActive?: boolean;
  position?: number;
}

const PlayerCard = ({
  name,
  balance,
  isActive = false,
  position = 0
}: PlayerCardProps): JSX.Element => {
  return (
    <div
      className={`rounded-xl border bg-background-secondary p-4 shadow-lg transition-all duration-300 ${
        isActive
          ? 'border-primary-400 shadow-primary-500/30'
          : 'border-slate-600'
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{name}</h3>
        {isActive && (
          <span className="h-3 w-3 animate-pulse rounded-full bg-primary-400"></span>
        )}
      </div>
      <div className="space-y-1 text-sm text-gray-300">
        <div>
          <span className="text-gray-400">Balance:</span>{' '}
          <span className="font-medium text-green-400">${balance}</span>
        </div>
        <div>
          <span className="text-gray-400">Position:</span>{' '}
          <span className="font-medium">{position}</span>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;
