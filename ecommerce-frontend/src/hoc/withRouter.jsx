import { Component } from 'react';
import {
  useNavigate,
  useLocation,
  useParams,
  useSearchParams,
} from 'react-router-dom';

const withRouter = (WrappedComponent) => {
  const RouterBridge = (props) => {
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

  class WithRouterComponent extends Component {
    render() {
      return <RouterBridge {...this.props} />;
    }
  }

  WithRouterComponent.displayName = `WithRouter(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithRouterComponent;
};

export default withRouter;
