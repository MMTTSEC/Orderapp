// StaffHeader.tsx
import { type FC } from 'react';
import { Link } from 'react-router-dom';

interface StaffHeaderProps {
    username: string;
    logoText?: string;
}

const UserIcon: FC = () => (
    <i className="bi bi-person-fill"></i>
);

export const StaffHeader: FC<StaffHeaderProps> = ({
    username,
    logoText = 'Cafe\nLogos'
}) => {
    return (
        <header className="staff-header">
            <div className="logo-container">
                <Link to="/staff" className="logo-link" aria-label="Gå till personal-sidan">
                    <div className="logo-circle">
                        {logoText.split('\n').map((line, i, arr) => (
                            <span key={i}>
                                {line}
                                {i < arr.length - 1 && <br />}
                            </span>
                        ))}
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