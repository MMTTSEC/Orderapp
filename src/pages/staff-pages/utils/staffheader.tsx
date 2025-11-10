// StaffHeader.tsx
import { type FC } from 'react';
import { Link } from 'react-router-dom';
import burgerLogo from '../../../assets/logo.png';

interface StaffHeaderProps {
    username: string;
    logoText?: string;
}

const UserIcon: FC = () => (
    <i className="bi bi-person-fill"></i>
);

export const StaffHeader: FC<StaffHeaderProps> = ({
    username
}) => {
    return (
        <header className="staff-header">
            <div className="logo-container">
                <Link to="/staff" className="logo-link" aria-label="Gå till personal-sidan">
                    <div className="logo-circle">
                        <img 
                            src={burgerLogo} 
                            alt="Burger Bliss Logo" 
                            className="logo-image"
                        />
                    </div>
                </Link>
            </div>
            <div className="user-info">
                <UserIcon />
                <span>{username}</span>
            </div>
        </header>
    );
};