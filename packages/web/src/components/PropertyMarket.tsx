import React, { useMemo, useState } from 'react';
import type { GameState, PlayerId, PropertyId } from '@project/rules';
import { formatMoney, formatPlayerName, getPropertyGroupColor } from '../utils/formatting';

interface PropertyMarketProps {
  gameState: GameState;
  currentPlayerId: PlayerId;
  selectedPropertyId?: PropertyId | null;
  onSelectProperty?: (propertyId: PropertyId) => void;
  onBuy: (propertyId: PropertyId) => void;
  onSell: (propertyId: PropertyId) => void;
  onMortgage: (propertyId: PropertyId) => void;
  onTradeOffer: (propertyId: PropertyId, targetPlayerId: PlayerId) => void;
}

export function PropertyMarket({
  gameState,
  currentPlayerId,
  onBuy,
  onSell,
  onMortgage,
  onTradeOffer,
}: PropertyMarketProps) {
  const [selectedPropertyId, setSelectedPropertyId] = useState<PropertyId | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isTradeOpen, setIsTradeOpen] = useState(false);
  const [tradeTarget, setTradeTarget] = useState<PlayerId | null>(null);

  const properties = useMemo(() => {
    return Object.entries(gameState.config.properties).map(([id, property]) => {
      const owner = gameState.propertyOwnership[id];
      const isOwnedByCurrent = owner === currentPlayerId;
      const isAvailable = owner === null;

      return {
        id,
        name: property.name,
        price: property.purchasePrice,
        rent: property.baseRent,
        owner,
        isOwnedByCurrent,
        isAvailable,
        group: property.group,
      };
    });
  }, [gameState, currentPlayerId]);

  const selectedProperty = selectedPropertyId
    ? properties.find((prop) => prop.id === selectedPropertyId)
    : null;

  const otherPlayers = gameState.config.playerOrder.filter((id) => id !== currentPlayerId);

  const handleTradeOffer = () => {
    if (selectedProperty && tradeTarget) {
      onTradeOffer(selectedProperty.id, tradeTarget);
      setIsTradeOpen(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        background: '#fafafa',
        borderRadius: '12px',
        padding: '16px',
        height: '100%',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Property Market</h3>
        <button
          style={{
            padding: '6px 12px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
          onClick={() => setIsDetailsOpen(true)}
          disabled={!selectedProperty}
        >
          View Details
        </button>
      </div>

      <div style={{ maxHeight: '220px', overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
        {properties.map((property) => (
          <div
            key={property.id}
            onClick={() => setSelectedPropertyId(property.id)}
            style={{
              padding: '10px 12px',
              cursor: 'pointer',
              background: selectedPropertyId === property.id ? '#e3f2fd' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              borderBottom: '1px solid #e0e0e0',
            }}
          >
            <div
              style={{
                width: '10px',
                height: '40px',
                borderRadius: '4px',
                background: getPropertyGroupColor(property.group),
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{property.name}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {property.isAvailable ? 'Available' : `Owner: ${formatPlayerName(property.owner || '')}`}
              </div>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
              {formatMoney(property.price)}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        <button
          onClick={() => selectedProperty && onBuy(selectedProperty.id)}
          disabled={!selectedProperty || !selectedProperty.isAvailable}
          style={buttonStyle('#4CAF50')}
        >
          Buy Property
        </button>
        <button
          onClick={() => selectedProperty && onSell(selectedProperty.id)}
          disabled={!selectedProperty || !selectedProperty.isOwnedByCurrent}
          style={buttonStyle('#FF9800')}
        >
          Sell Property
        </button>
        <button
          onClick={() => selectedProperty && onMortgage(selectedProperty.id)}
          disabled={!selectedProperty || !selectedProperty.isOwnedByCurrent}
          style={buttonStyle('#9C27B0')}
        >
          Mortgage
        </button>
        <button
          onClick={() => {
            if (selectedProperty) {
              setTradeTarget(otherPlayers[0] ?? null);
              setIsTradeOpen(true);
            }
          }}
          disabled={!selectedProperty || otherPlayers.length === 0}
          style={buttonStyle('#2196F3')}
        >
          Offer Trade
        </button>
      </div>

      {selectedProperty && (
        <div
          style={{
            background: '#fff',
            borderRadius: '10px',
            padding: '12px',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
          }}
        >
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Selected Property</div>
          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{selectedProperty.name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Status: {selectedProperty.isAvailable ? 'Available' : `Owned by ${formatPlayerName(selectedProperty.owner || '')}`}
          </div>
        </div>
      )}

      {/* Property details modal */}
      {isDetailsOpen && selectedProperty && (
        <Modal title={`${selectedProperty.name} Details`} onClose={() => setIsDetailsOpen(false)}>
          <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <dt style={detailsTermStyle}>Purchase Price</dt>
              <dd style={detailsValueStyle}>{formatMoney(selectedProperty.price)}</dd>
            </div>
            <div>
              <dt style={detailsTermStyle}>Base Rent</dt>
              <dd style={detailsValueStyle}>{formatMoney(selectedProperty.rent)}</dd>
            </div>
            <div>
              <dt style={detailsTermStyle}>Owner</dt>
              <dd style={detailsValueStyle}>
                {selectedProperty.isAvailable
                  ? 'Unowned'
                  : formatPlayerName(selectedProperty.owner || '')}
              </dd>
            </div>
            <div>
              <dt style={detailsTermStyle}>Group</dt>
              <dd style={detailsValueStyle}>{selectedProperty.group}</dd>
            </div>
          </dl>
        </Modal>
      )}

      {/* Trade dialog */}
      {isTradeOpen && selectedProperty && (
        <Modal title={`Offer Trade: ${selectedProperty.name}`} onClose={() => setIsTradeOpen(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ fontSize: '14px', color: '#555' }}>
              Target Player
              <select
                value={tradeTarget ?? ''}
                onChange={(event) => setTradeTarget(event.target.value as PlayerId)}
                style={{
                  width: '100%',
                  marginTop: '6px',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                }}
              >
                <option value="" disabled>
                  Select player
                </option>
                {otherPlayers.map((player) => (
                  <option key={player} value={player}>
                    {formatPlayerName(player)}
                  </option>
                ))}
              </select>
            </label>

            <button
              onClick={handleTradeOffer}
              disabled={!tradeTarget}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: 'none',
                background: '#2196F3',
                color: 'white',
                fontWeight: 'bold',
                cursor: tradeTarget ? 'pointer' : 'not-allowed',
              }}
            >
              Send Offer
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

const buttonStyle = (color: string): React.CSSProperties => ({
  padding: '10px 12px',
  borderRadius: '8px',
  border: 'none',
  background: color,
  color: 'white',
  fontWeight: 'bold',
  cursor: 'pointer',
  boxShadow: '0 3px 6px rgba(0, 0, 0, 0.15)',
});

const detailsTermStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '12px',
  color: '#777',
  textTransform: 'uppercase',
};

const detailsValueStyle: React.CSSProperties = {
  margin: '4px 0 0',
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#333',
};

interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

function Modal({ title, children, onClose }: ModalProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          width: '400px',
          maxWidth: '90%',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#666',
            }}
          >
            ×
          </button>
        </div>
        <div style={{ marginTop: '16px' }}>{children}</div>
      </div>
    </div>
  );
}
