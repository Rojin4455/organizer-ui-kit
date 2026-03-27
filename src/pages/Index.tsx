import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { TaxOrganizerApp } from '../components/TaxOrganizerApp';
import type { RootState } from '../store/store';

const Index = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { tokens } = useSelector((state: RootState) => state.auth);
  const rehydrated = useSelector((state: RootState) => state._persist?.rehydrated === true);

  useEffect(() => {
    const redirectUri = searchParams.get('redirect_uri');
    if (!redirectUri || !rehydrated) return;

    const access =
      tokens?.access || (typeof localStorage !== 'undefined' ? localStorage.getItem('accessToken') : null);
    if (access) {
      navigate(`/sso?redirect_uri=${encodeURIComponent(redirectUri)}`, { replace: true });
    }
  }, [searchParams, rehydrated, tokens?.access, navigate]);

  return <TaxOrganizerApp />;
};

export default Index;

