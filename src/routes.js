import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter, Route, Switch } from "react-router-dom";
import {
  HomePage,
  Products,
  Cart,
  Orders,
  LoginForm,
  SignupForm,
  Checkout,
  Confirmation,
  Account,
  Listings,
  UserList,
  OrderListing,
  AddProduct,
  EditProduct,
} from "./client/components/index";
import { me, getProducts, getUsers } from "./client/store";
import { getOrderItems } from "./client/store/orderItems";
import { getOrders } from "./client/store/orders";
import { useHistory } from "react-router-dom";

class Routes extends Component {
  constructor() {
    super();
  }

  componentDidMount() {
    this.props.loadInitialData();
  }
  render() {
    const { isLoggedIn } = this.props;
    const { user } = this.props;
    return (
      <Switch>
        {/* Routes placed here are available to all visitors */}
        <Route exact path="/" component={HomePage} />
        <Route path="/login" component={LoginForm} />
        <Route path="/signup" component={SignupForm} />
        <Route exact path="/products" component={Products} />
        <Route path="/cart" component={Cart} />
        <Route path="/orders" component={Orders} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/confirmation/:id" component={Confirmation} />
        {isLoggedIn && (
          <Switch>
            <Route exact path="/account" component={Account} />
            <Route exact path="/listings" component={Listings} />
            <Route exact path="/userlist" component={UserList} />
            <Route exact path="/orderlist" component={OrderListing} />
            <Route exact path="/products/:id/edit" component={EditProduct} />
            <Route exact path="/newProduct" component={AddProduct} />
            {/* Routes placed here are only available after logging in */}
          </Switch>
        )}
        {/* {user.admin == true && <Switch />} */}
        {/* Displays our Login component as a fallback */}
        {/* <Route component={Login} /> */}
      </Switch>
    );
  }
}

const mapState = (state) => {
  return {
    isLoggedIn: !!state.user.id,
    user: state.user,
    products: state.products,
    orders: state.orders,
    orderItems: state.orderItems,
  };
};

const mapDispatch = (dispatch) => {
  return {
    loadInitialData() {
      dispatch(me());
      dispatch(getProducts());
      dispatch(getUsers());
      dispatch(getOrders());
      dispatch(getOrderItems());
    },
  };
};

export default withRouter(connect(mapState, mapDispatch)(Routes));
