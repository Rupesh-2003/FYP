import React, { useState } from "react";
import { Link, Redirect } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import web3 from "../services/web3";

import {
  Box,
  TextField,
  Checkbox,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import DatePicker from "@mui/lab/DatePicker";

import { CoreButton, Heading, ThemeText } from "../components/core";

import { AUTHORITY_TYPES } from "../Constants/authorityTypes";
import { PROGRESS_STATUSES } from "../Constants/progressStatus";

import {
  newPatientRegistration,
  isPatientAlreadyRegistered,
  sendEth,
} from "../apis/medblock";
import { useAuth } from "../services/authorization";
import { dateToTimestamp, figureOutGender } from "../utils/dataUtils";
import {
  generateAddressFile,
  generateKeyFile,
} from "../utils/generateKeyFiles";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

import {
  DashboardIcon,
  DownloadIcon,
  NoteSection,
} from "./PatientRegistration.styled";
import basicIllustration from "../assets/illustrations/Overview.png";

const PatientRegistration = () => {
  const auth = useAuth();

  const [progress, setProgress] = useState(PROGRESS_STATUSES.DETAILS);
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [dob, setDob] = useState(null);
  const [gender, setGender] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [generatedAccount, setGeneratedAccount] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const validateForm = () => {
    if (!fname || !lname) {
      setError("Please enter both first and last name");
      return false;
    }
    if (!phone || phone.length < 10) {
      setError("Please enter a valid phone number");
      return false;
    }
    if (!dob) {
      setError("Please select date of birth");
      return false;
    }
    if (!address) {
      setError("Please enter address");
      return false;
    }
    if (!termsAccepted) {
      setError("Please accept the terms and conditions");
      return false;
    }
    setError(null);
    return true;
  };

  async function registerPatient() {
    if (!validateForm()) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Generate new account
      const newPatientAccount = web3.eth.accounts.create(phone + fname + lname);
      console.log("New patient account generated: ", newPatientAccount);

      // Check if address is already registered
      const isOccupied = await isPatientAlreadyRegistered(newPatientAccount.address);
      if (isOccupied) {
        throw new Error("Generated address is occupied. Please try again");
      }

      // Convert DOB to timestamp
      const dobTimestamp = dateToTimestamp(dob);

      // Register patient
      const registrationSuccess = await newPatientRegistration(
        fname,
        lname,
        phone,
        address,
        newPatientAccount.address,
        dobTimestamp,
        gender,
        auth.wallet.address
      );

      if (!registrationSuccess) {
        throw new Error("Failed to register patient");
      }

      // Send initial ETH
      console.log("sending patient initial eth")
      await sendEth(auth.wallet.address, newPatientAccount.address, "0.001");
      console.log("Sent eth")
    
      // Update state
      setGeneratedAccount(newPatientAccount);
      setProgress(PROGRESS_STATUSES.SUCCESS);
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Failed to register patient. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }

  function downloadAddress() {
    if (!generatedAccount) return;
    generateAddressFile(`${fname}-${lname}`, generatedAccount.address);
  }

  async function downloadPrivateKey() {
    if (!generatedAccount) return;
    generateKeyFile(`${fname}-${lname}`, generatedAccount.privateKey);
  }

  if (!auth.loggedIn || !auth.entityInfo || !auth.wallet || !auth.authority) {
    auth.logout();
    return <Redirect to="/login/admin" />;
  }

  if (auth.authority !== AUTHORITY_TYPES.ADMIN) return <Redirect to="/" />;

  return (
    <Container className="pt-4">
      <Row>
        <Col lg={5} className="d-none d-lg-block">
          <img className="w-100" alt="about medBlock" src={basicIllustration} />
        </Col>
        <Col md={0} lg={1}></Col>
        <Col md={12} lg={6}>
          {progress === PROGRESS_STATUSES.DETAILS ? (
            <center>
              <Heading className="my-1" fontSize="27px">
                Patient registration
              </Heading>
              <br />
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              <Box component="form">
                <div>
                  <Row>
                    <Col>
                      <TextField
                        required
                        fullWidth
                        autoComplete="nope"
                        variant="outlined"
                        label="First name"
                        value={fname}
                        onChange={(e) => setFname(e.target.value)}
                      />
                    </Col>
                    <Col>
                      <TextField
                        required
                        fullWidth
                        variant="outlined"
                        label="Last name"
                        autoComplete="nope"
                        value={lname}
                        onChange={(e) => setLname(e.target.value)}
                      />
                    </Col>
                  </Row>
                  <br />
                  <Row>
                    <Col
                      md={6}
                      style={{ paddingLeft: "22px", paddingRight: "22px" }}
                    >
                      <Row>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            label="Date of birth"
                            disableHighlightToday
                            renderInput={(params) => <TextField {...params} />}
                            value={dob}
                            maxDate={new Date()}
                            openTo="year"
                            views={["year", "month", "day"]}
                            onChange={setDob}
                          />
                        </LocalizationProvider>
                      </Row>
                      <br />
                      <Row>
                        <FormControl fullWidth>
                          <InputLabel>Gender</InputLabel>
                          <Select
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            label="Gender"
                          >
                            <MenuItem value={0}>Male</MenuItem>
                            <MenuItem value={1}>Female</MenuItem>
                            <MenuItem value={2}>Non Binary</MenuItem>
                          </Select>
                        </FormControl>
                      </Row>
                      <br />
                      <Row>
                        <TextField
                          required
                          variant="outlined"
                          label="Phone number"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          autoComplete="nope"
                          type="tel"
                        />
                        <br />
                        <br />
                        <br />
                      </Row>
                    </Col>
                    <Col>
                      <TextField
                        label="Address"
                        fullWidth
                        multiline
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        rows={8}
                        autoComplete="nope"
                      />
                    </Col>
                  </Row>
                  <Checkbox
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    required
                  />
                  Patient agrees to the Terms and conditions & <br />
                  All necessary documents are verified
                </div>
              </Box>
              <br />
              <CoreButton
                size="lg"
                disabled={isProcessing}
                onClick={registerPatient}
              >
                {isProcessing ? (
                  <>
                    Registering Patient &nbsp;&nbsp;
                    <FontAwesomeIcon icon={faSpinner} className="fa-spin" />
                  </>
                ) : (
                  "Register Patient"
                )}
              </CoreButton>
            </center>
          ) : progress === PROGRESS_STATUSES.SUCCESS ? (
            <div>
              <div className="d-flex justify-content-end">
                <Link
                  to="/adminDashboard"
                  className="text-dark text-decoration-none"
                >
                  <DashboardIcon />
                  Go to dashboard
                </Link>
              </div>
              <br />
              <br />
              <br />
              <div id="receipt-pdf-content">
                <Heading fontSize="36px">
                  Patient successfully registered!
                </Heading>
                <br />
                <Heading fontSize="25px">
                  {fname} {lname}
                </Heading>
                <Heading fontSize="18px">{figureOutGender(gender)}</Heading>
                <br />
                <br />
                <div className="d-flex justify-content-between">
                  <CoreButton
                    color="#202020"
                    background="#FFDE00"
                    fontSize="16px"
                    paddingLeftRight="18px"
                    onClick={downloadPrivateKey}
                  >
                    Download Private key card
                    <DownloadIcon />
                  </CoreButton>
                  <CoreButton
                    color="#202020"
                    background="#FFDE00"
                    fontSize="16px"
                    paddingLeftRight="18px"
                    onClick={downloadAddress}
                  >
                    Download address card
                    <DownloadIcon />
                  </CoreButton>
                </div>
                <br />
                <br />
                <br />
                <br />
                <NoteSection>Note:</NoteSection>
                Address and Private key card will not be accessible later.
                <br />
                Please store them securely.
              </div>
            </div>
          ) : null}
        </Col>
      </Row>
    </Container>
  );
};

export default PatientRegistration;