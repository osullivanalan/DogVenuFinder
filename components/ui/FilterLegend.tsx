import React from 'react';

export interface VenueType {
    id: string;
    label: string;
    color: string; // hex color like #dc3545
    count: number;
    emoji: string;
}

interface Props {
    types: VenueType[];
    selected: string[];
    toggle: (id: string) => void;
    selectAll: () => void;
    selectNone: () => void;
}

export default function FilterLegend({
    types,
    selected,
    toggle,
    selectAll,
    selectNone,
}: Props) {
    const all = selected.length === types.length;
    const none = selected.length === 0;

    return (
        <div className="legend">
            <div className="legend-content">
                {/* Filter Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>

                    <button
                        disabled={all}
                        onClick={selectAll}
                        style={{
                            background: 'none',
                            backgroundColor: 'var(--color-background)',
                            border: 'none',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '500',
                            cursor: all ? 'not-allowed' : 'pointer',
                            color: all ? 'var(--color-text-secondary)' : 'var(--color-primary)',
                            opacity: all ? 0.5 : 1,
                        }}
                    >
                        All
                    </button>

                    <span style={{ color: 'var(--color-text-secondary)' }}>|</span>


                </div>

                {/* Venue Type Filters - matching original legend style */}
                {types.map((type) => {
                    const isSelected = selected.includes(type.id);

                    return (
                        <div
                            key={type.id}
                            className="legend-item"
                            onClick={() => toggle(type.id)}
                            style={{
                                cursor: 'pointer',
                                opacity: isSelected ? 1 : 0.5,
                                transition: 'opacity 0.2s ease',
                                padding: '4px 4px',
                                borderRadius: '6px',
                                backgroundColor: isSelected ? 'var(--color-background)' : 'transparent',
                            }}
                            title={`${isSelected ? 'Hide' : 'Show'} ${type.label} venues`}
                        >
                            {/* Color marker - exact same as original legend */}
                            {/* Color marker with emoji inside */}
                            <div
                                className="legend-marker"
                                style={{
                                    backgroundColor: type.color,
                                    fontSize: '12px',
                                    lineHeight: '1',
                                    marginRight: '8px'

                                }}
                            >
                                {type.emoji}
                            </div>

                            {/* Label and count */}
                            <span style={{
                                color: isSelected ? 'var(--color-text)' : 'var(--color-text-secondary)',
                                fontWeight: isSelected ? '500' : '400',
                                fontSize: 'small',
                            }}>
                                {/*type.label*/} 
                                {type.count}
                            </span>
                        </div>
                    );
                })}

                {/* Results summary 
                <div style={{
                    marginLeft: 'auto',
                    fontSize: '12px',
                    color: 'var(--color-text-secondary)',
                    fontWeight: '500'
                }}>
                    {none ? (
                        'None'
                    ) : (
                        `(${types
                            .filter(type => selected.includes(type.id))
                            .reduce((sum, type) => sum + type.count, 0)})`
                    )}
                </div>
                */}
            </div>
        </div>
    );
}
