import React, { Component, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import ProductList from "./ProductList";
import { updateOrder, createOrder } from "../store/orders";
import axios from "axios";
import { me } from "../store";
import StripeCheckout from "react-stripe-checkout";

import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "600px",
    marginLeft: "5%",
    marginRight: "5%",
    marginTop: "3%",
    marginBottom: "3%",
    paddingTop: "2%",
    paddingLeft: "5%",
    paddingRight: "5%",
    paddingBottom: "2%",
  },
  center: {
    display: "flex",
    justifyContent: "center",
  },
  leftContainer: {
    padding: "2%",
    width: "60%",
    minHeight: "600px",
  },
  rightContainer: {
    minHeight: "600px",
    padding: "2%",
    width: "35%",
  },
}));

const Checkout = ({
  user,
  cart,
  orderItems,
  products,
  acceptOrder,
  createNewCart,
  handleChange,
  loadUser,
  history,
}) => {
  const [firstName, setFirstName] = useState(
    user.firstName ? user.firstName : ""
  );
  const [lastName, setLastName] = useState(user.lastName ? user.lastName : "");
  const [email, setEmail] = useState(user.email ? user.email : "");
  const [address, setAddress] = useState(user.address ? user.address : "");

  const classes = useStyles();

  useEffect(
    (prevProps) => {
      loadUser();
      console.log(firstName, lastName, email, address);
    },
    [firstName, lastName, email, address]
  );

  async function onSubmit() {
    try {
      await acceptOrder(
        {
          id: cart.id,
          status: "accepted",
          firstName: firstName,
          lastName: lastName,
          email: email,
          address: address,
        },
        history.push
      );
      await createNewCart({
        userId: user.id ? user.id : localStorage.getItem("guestId"),
        status: "cart",
      });
    } catch (exception) {
      console.log(exception);
    }
  }

  async function handleChange(ev) {
    this.setState({
      [ev.target.name]: ev.target.value,
    });
  }

  async function handleToken(token) {
    const response = await axios.post("/api/stripe/checkout", {
      token,
      order: cart,
    });

    const { status } = response.data;

    console.log(status);

    if (status === "success") {
      onSubmit();
    }
  }

  if (!cart || !orderItems) {
    return <h1>Loading...</h1>;
  } else {
    const cartOrderItems = orderItems.filter(
      (orderItem) => orderItem.orderId === cart.id
    );
    return (
      <Paper className={classes.root}>
        {/* <form onSubmit={onSubmit}> */}
        <Grid container direction="row" justify="space-evenly">
          <Paper className={classes.leftContainer}>
            <Typography className={classes.center} variant="h4">
              Items in Cart
            </Typography>
            <div>
              <ul>
                {cartOrderItems.map((orderItem) => (
                  <ProductList key={Math.random()} {...orderItem} />
                ))}
              </ul>
            </div>
          </Paper>
          <Paper className={classes.rightContainer}>
            <Typography className={classes.center} variant="h4">
              Shipping/Billing
            </Typography>
            <Grid container direction="column" justify="space-between">
              <TextField
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                label="First Name"
              />
              <TextField
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                label="Last Name"
              />
              <TextField
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                label="Email"
              />
              <TextField
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                label="Address"
              />
              <Typography className={classes.center} variant="h4">
                Payment Method{" "}
              </Typography>
              <Typography>
                Total Price: ${parseFloat(cart.totalPrice).toFixed(2)}
              </Typography>
              <Button variant="outlined" href="/cart">
                Edit Cart
              </Button>
              <StripeCheckout
                disabled={!firstName || !lastName || !email || !address}
                stripeKey="pk_test_E1dVa6505p5SZc6KIGv6yrQB00yOT20RJM"
                token={handleToken}
                email={email}
                amount={parseFloat(cart.totalPrice).toFixed(2) * 100}
                onSubmit={onSubmit}
              />
            </Grid>
          </Paper>
        </Grid>
        {/* </form> */}
      </Paper>
    );
  }
};

const mapStateToProps = ({ user, orders, orderItems, products }) => {
  const cart = user.id
    ? orders.find(
        (order) => order.status === "cart" && order.userId === user.id
      )
    : orders.find(
        (order) =>
          order.status === "cart" &&
          order.userId === localStorage.getItem("guestId")
      );
  return {
    user,
    cart,
    orderItems,
    products,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    acceptOrder: (order, push) => dispatch(updateOrder(order, push)),
    createNewCart: (order) => dispatch(createOrder(order)),
    loadUser: () => dispatch(me()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Checkout);