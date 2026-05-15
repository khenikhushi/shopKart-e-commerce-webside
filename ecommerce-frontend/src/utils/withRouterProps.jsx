import { useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom';

/**
 * withRouterProps HOC - Provides React Router v6 hooks to class components
 * Wraps a class component in a functional component that uses router hooks
 * Injects router state and methods as props
 */
const withRouterProps = (WrappedComponent) => {
  return (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();
    const [searchParams, setSearchParams] = useSearchParams();

    return (
      <WrappedComponent
        {...props}
        navigate={navigate}
        location={location}
        params={params}
        searchParams={searchParams}
        setSearchParams={setSearchParams}
      />
    );
  };
};

export default withRouterProps;
