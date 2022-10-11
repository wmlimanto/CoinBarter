import * as React from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { Button } from '@mui/material';
import { Box } from "@mui/system";
import { useState } from "react";
import { ethers } from "ethers";
import ErrorMessage from './ErrorMessage';
import TxList from './TxList';
import { useNavigate } from 'react-router-dom';
import { clearFavorites } from "../../features/favoriteSlice";
import {  clearCart } from "../../features/cartSlice";
import { useDispatch } from "react-redux";

// set to admin_coinbarter
const DEFAULT_DESTINATION_ADDR = "0xE1096fBC80a1968d1A0ADbd29C2c76595A44954B";

export default function CryptoPaymentForm({backStep, nextStep}) {

  // hooks to set amount and destination addr
  const [amount, setAmount] = useState();
  const [destinationAddr, setDestinationAddr] = useState(DEFAULT_DESTINATION_ADDR);
  // states for error msg and capture tx
  const [error, setError] = useState("");
  const [txs, setTxs] = useState([]);
  const navigate = useNavigate()
  const dispatch = useDispatch();


  // ({ setError, setTxs, amount, destinationAddr })
  // initialize connection with metamask wallet
  const startPayment = async ( event ) => {

    console.log("debug:", { amount, destinationAddr });

    // reset state displaying error msg
    setError("");

    event.preventDefault();

    try {
      // throw this error if user doesn't have a metamask wallet
      if (!window.ethereum)
        throw new Error("No crypto wallet found. Please install it.");

      // ask user for permission to connect with metamask wallet
      await window.ethereum.send("eth_requestAccounts");

      // establish connection with eth provider to send tx
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // get testnet network
      const network = await provider.getNetwork();

      // validate destination addr
      ethers.utils.getAddress(destinationAddr);

      // create the tx; to which addr & how much eth (converted to wei)
      const tx = await signer.sendTransaction({
        to: destinationAddr,
        value: ethers.utils.parseEther(amount.toString())
      });
      console.log({ amount, destinationAddr });
      console.log("tx", tx);
      // add tx hash id to TxList to display tx id to user
      setTxs([tx]);

      // move to order confirmation step after 10 seconds
      // setTimeout(() => {
      //   nextStep();
      // }, 10000)
      setTimeout(() => {
        dispatch(clearFavorites())
        dispatch(clearCart())
        navigate("/my-orders")
      }, 5000)
    } catch (error) {
      setError(error.reason);
      console.log({error});
    }
  };

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Send ETH Payment
      </Typography>
      <Grid container spacing={3} component="form">
        <Grid item xs={12}>
          <TextField
            id="destinationAddr"
            label="Destination Address"
            fullWidth
            variant="standard"
            value={destinationAddr}
            onChange={event => {setDestinationAddr(event.target.value)}}
          />
          <Typography variant="body2" sx={{fontStyle: 'italic', color: 'red'}}>
            * destination address has been set to CoinBarter wallet
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="amount"
            type="number"
            label="Amount in ETH"
            fullWidth
            variant="standard"
            value={amount}
            onChange={event => {setAmount(Number.parseFloat(event.target.value))}}
          />
        </Grid>
        
        <br />
        <Grid item xs={12} sx={{ mt: 2 }}>
          <Box
                display="flex"
                alignitems="center"
                fullWidth={true}
                justifyContent="space-between"
                sx={{ mt: 2 }}>
            <Button variant='outlined'
                    fullWidth={true}
                    sx={{ mr: 1 }}
                    type='submit'
                    onClick={backStep}
                    >
                Back
            </Button>
            <Button variant='contained'
                    fullWidth={true}
                    sx={{ mr: 1 }}
                    // type='submit'
                    onClick={startPayment}
                    >
              Pay Now
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} sx={{ mt: 1 }}>
        <ErrorMessage message={error} />
        <TxList txs={txs} />
        </Grid>
      </Grid>
    </>
  );
}