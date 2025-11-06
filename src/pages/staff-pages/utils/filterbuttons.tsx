// FilterButtons.tsx
import { type FC } from 'react';

interface FilterButton {
    id: string;
    label: string;
    count?: number;
    isActive: boolean;
    onClick: () => void;
}

interface FilterButtonsProps {
    filters: FilterButton[];
}

export const FilterButtons: FC<FilterButtonsProps> = ({ filters }) => {
    return (
        <div className="filter-buttons">
            {filters.map((filter) => (
                <button
                    key={filter.id}
                    className={`filter-button ${filter.isActive ? 'active' : ''}`}
                    onClick={filter.onClick}
                >
                    {filter.label}
                    {filter.count !== undefined && `(${filter.count})`}
                </button>
            ))}
        </div>
    );
};