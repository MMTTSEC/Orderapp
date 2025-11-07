// BottomNavMenu.tsx
import React from 'react';
import '../../../styles/bottomNavMenu.css';

// Types
interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    isActive?: boolean;
}

interface BottomNavProps {
    items: NavItem[];
    className?: string;
}

// Main Component
export const BottomNav: React.FC<BottomNavProps> = ({ items, className = '' }) => {
    return (
        <nav className={`bottom-nav ${className}`}>
            {items.map((item) => (
                <button
                    key={item.id}
                    onClick={item.onClick}
                    className={`nav-item ${item.isActive ? 'active' : ''}`}
                    aria-label={item.label}
                >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                </button>
            ))}
        </nav>
    );
};

// Icon Components
const CircleIcon: React.FC = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="10" strokeWidth="2" />
    </svg>
);

const ClockIcon: React.FC = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="10" strokeWidth="2" />
        <path d="M12 6v6l4 2" strokeWidth="2" />
    </svg>
);

const DoorIcon: React.FC = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8" strokeWidth="2" />
        <path d="M20 12h-8M17 9l3 3-3 3" strokeWidth="2" />
    </svg>
);

// Export icons for use in other components
export { CircleIcon, ClockIcon, DoorIcon };