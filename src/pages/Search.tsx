
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import SearchPage from '@/components/Search/SearchPage';

const Search = () => {
  const navigate = useNavigate();

  const handleUserSelect = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <Header />
      <SearchPage onUserSelect={handleUserSelect} />
    </div>
  );
};

export default Search;
