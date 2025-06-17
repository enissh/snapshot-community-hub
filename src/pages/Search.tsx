
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import SearchPage from '@/components/Search/SearchPage';

const Search = () => {
  const navigate = useNavigate();

  const handleUserSelect = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <SearchPage onUserSelect={handleUserSelect} />
    </div>
  );
};

export default Search;
