// StaffHeader.tsx
import { type FC } from 'react';

interface StaffHeaderProps {
    username: string;
    logoText?: string;
}

const UserIcon: FC = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor" />
    </svg>
);

export const StaffHeader: FC<StaffHeaderProps> = ({
    username,
    logoText = 'Cafe\nLogos'
}) => {
    return (
        <header className="staff-header">
            <div className="logo-container">
                <div className="logo-circle">
                    <span>{logoText.split('\n').map((line, i) => (
                        <span key={i}>
                            {line}
                            {i < logoText.split('\n').length - 1 && <br />}
                        </span>
                    ))}</span>
                </div>
            </div>
            <div className="user-info">
                <UserIcon />
                <span>{username}</span>
            </div>
        </header>
    );
};