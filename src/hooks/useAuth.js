import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../store/slices/authSlice';

export default function useAuth() {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, status, error, bootstrapped } = useSelector((s) => s.auth);

  const logout = () => dispatch(logoutUser());

  return { user, token, isAuthenticated, status, error, bootstrapped, logout };
}
