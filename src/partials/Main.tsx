import { Outlet } from 'react-router-dom';

type HeaderProps = {

  };

export default function Main({}: HeaderProps) {
  return <main>
    <Outlet context={{}} />
  </main>;
}