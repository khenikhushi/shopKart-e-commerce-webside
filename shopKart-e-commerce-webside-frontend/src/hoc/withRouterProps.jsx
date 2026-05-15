import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';

const withRouterProps = (WrappedComponent) => {
  const WithRouterProps = (props) => {
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

  WithRouterProps.displayName = `withRouterProps(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithRouterProps;
};

export default withRouterProps;
