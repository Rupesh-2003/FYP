import React, { useState } from "react";
import { Redirect } from "react-router-dom";
import { QRCode } from "react-qrcode-logo";
import TextField from "@mui/material/TextField";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import Checkbox from "@mui/material/Checkbox";
import DatePicker from "@mui/lab/DatePicker";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import { Preview, print } from "react-html2pdf";

import { ModalUpload, Backdrop } from "../components/ModalUpload";
import { CoreButton } from "../components/core";
import KeyInputs from "../components/KeyInputs";

import { getPatientPersonalInfo, addNewRecord } from "../apis/medblock";
import { PROGRESS_STATUSES } from "../Constants/progressStatus";
import Nbsp from "../utils/nbsp";
import {
  dateFromTimestamp,
  dateToTimestamp,
  calculateAge,
  figureOutGender,
  getInitials,
} from "../utils/dataUtils";
import { useAuth } from "../services/authorization";

import {
  HospitalDashboardContainer,
  Left,
  Right,
  Center,
  Navlink,
  NavlinkActive,
  NavMenuList,
  ListItems,
  ListItemsActive,
  Name,
  TitleHosp,
  HospitalStyling,
  HopitalCard,
  HospitalCardName,
  Circle,
  HospCardReg,
  HospCardAdd,
  HospCardHeading,
  HospCardDetails,
  HospCardRow3,
  FCName,
  Note,
  NotesDiv,
  NoteTitle,
  NoteDescription,
} from "./HospitalDashboard.styled";

import {
  ConfirmHeading,
  Heading,
  HeadingDiv,
  Confirm,
  Details,
  PatientCol,
  MedicalCol,
  SubHeading,
  SubHeadingMedical,
  DetailsDiv,
  DetailsText,
  LeftDetails,
  LeftDetailsMedical,
  RightDetails,
  RightDetailsMedical,
  EachDetail,
  Buttons,
  InputContainer,
  InputSubContainer,
  RecieptHeading,
  Reciept,
  RecieptDetails,
  ReceiptDetailHead,
  ReceiptDetailsBody,
  RecieptQR,
  RecieptQrHead,
  RecieptQrLogo,
  RecieptContainer,
  RecieptLeftDetail,
  RecieptRightDetail,
  RecieptButton,
} from "./NewRecord.styled";

import { ReactComponent as Dashboard } from "../assets/icons/hospital/Dashboard.svg";
import { ReactComponent as AddNewRecordLogo } from "../assets/icons/hospital/AddNewRecordBlue.svg";
import { ReactComponent as LogoutLogo } from "../assets/icons/hospital/logouticon.svg";
import { ReactComponent as SettingsLogo } from "../assets/icons/hospital/settingsicon.svg";
import { ReactComponent as HospitalLogo } from "../assets/icons/hospital/hospital.svg";
import { ReactComponent as TickMark } from "../assets/icons/hospital/greentick.svg";
import { ReactComponent as BackArrow } from "../assets/icons/general/backArrow.svg";
import { ReactComponent as UploadLogo } from "../assets/icons/hospital/upload.svg";
import { ReactComponent as GreenTick } from "../assets/icons/admin/greentick.svg";
import { ReactComponent as HomeIcon } from "../assets/icons/admin/homeicon.svg";
import { ReactComponent as PrintIcon } from "../assets/icons/admin/printicon.svg";
import { ReactComponent as DeclineLogo } from "../assets/icons/hospital/Decline.svg";

const NewRecord = (props) => {
  const auth = useAuth();

  const [progress, setProgress] = useState(PROGRESS_STATUSES.PATIENT_ADDRESS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [modalState, setModalState] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [fileHashes, setFileHashes] = useState([]); // Changed from hashes to fileHashes for clarity

  const hospitalInfo = auth.entityInfo;

  const [disease, setDisease] = useState("");
  const [treatment, setTreatment] = useState("");
  const [medication, setMedication] = useState("");
  const [drname, setDrname] = useState("Dr. ");
  const [hospitaRecordlID, setHospitaRecordlID] = useState("");
  const [diagnoseDate, setDiagnoseDate] = useState(new Date());
  const [wasAdmitted, setWasAdmitted] = useState(false);
  const [dischargeDate, setDischargeDate] = useState(new Date());
  const [finalPatientAddress, setFinalPatientAddress] = useState(undefined);
  const [basicPatientInfo, setBasicPatientInfo] = useState({
    name: "John Doe",
    dob: "15/4/2002",
    dobTimeStamp: "1638985823",
    gender: "Male",
  });

  async function uploadBase64(base64String, fileName) {
    try {
      const binaryString = atob(base64String);
      const arrayBuffer = new ArrayBuffer(binaryString.length);
      const uint8Array = new Uint8Array(arrayBuffer);

      for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([uint8Array], { type: "application/octet-stream" });
      const file = new File([blob], fileName);

      const data = new FormData();
      data.append("file", file);

      const upload = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_PINATA_JWT}`,
          },
          body: data,
        }
      );

      const uploadRes = await upload.json();
      return uploadRes;
    } catch (error) {
      console.error("Error uploading to Pinata:", error);
      throw error;
    }
  }

  async function uploadFilesToPinata(files) {
    setIsUploading(true);
    const newHashes = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        
        await new Promise((resolve) => {
          reader.onload = async () => {
            try {
              const base64String = reader.result.split(",")[1];
              const response = await uploadBase64(base64String, file.name);
              newHashes.push({
                cid: response.IpfsHash,
                name: file.name
              });
              resolve();
            } catch (error) {
              console.error("Error uploading file:", error);
              resolve();
            }
          };
          reader.readAsDataURL(file);
        });
      }

      if (newHashes.length === 0) {
        throw new Error("No files were successfully uploaded");
      }

      setFileHashes(newHashes);
      return newHashes;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  }

  function uploadClickHandler() {
    setModalState(true);
  }

  function uploadFileHandler(files) {
    setUploadedFiles(files);
  }

  function closeModal() {
    setModalState(false);
  }

  async function processKeyToDetails(patientAddress) {
    setIsProcessing(true);
    try {
      const patientInfo = await getPatientPersonalInfo(patientAddress);
      setBasicPatientInfo({
        name: patientInfo.fname + " " + patientInfo.lname,
        dob: dateFromTimestamp(patientInfo.birthdate),
        dobTimeStamp: patientInfo.birthdate,
        gender: figureOutGender(patientInfo.gender),
      });
      setIsProcessing(false);
      setFinalPatientAddress(patientAddress);
      setProgress(PROGRESS_STATUSES.RECORD_DETAILS);
    } catch (err) {
      alert("Patient details not found :( \nVerify the address!");
      console.log(err);
      setIsProcessing(false);
    }
  }

  function goBackToDetails() {
    setIsProcessing(false);
    setProgress(PROGRESS_STATUSES.RECORD_DETAILS);
  }

  async function validateInformation() {
    if (!treatment || !medication) {
      alert("Please fill out all the fields !!");
      return;
    }

    if (uploadedFiles.length > 0) {
      try {
        setIsProcessing(true);
        await uploadFilesToPinata(uploadedFiles);
      } catch (error) {
        setIsProcessing(false);
        return;
      }
    }

    console.log("new record details:", {
      finalPatientAddress,
      disease,
      treatment,
      medication,
      drname,
      hospitaRecordlID,
      wasAdmitted,
      diagnoseDate,
      dischargeDate,
      fileHashes
    });
    
    setProgress(PROGRESS_STATUSES.CONFIRM);
    setIsProcessing(false);
  }

  async function sendNewRecord() {
    setIsProcessing(true);
    console.log("File hashes before sending:", fileHashes);
    
    try {
      const response = await addNewRecord(
        finalPatientAddress,
        disease,
        treatment,
        medication,
        drname,
        hospitaRecordlID,
        wasAdmitted,
        diagnoseDate,
        dischargeDate,
        fileHashes,
        auth.wallet.address
      );
      
      console.log(response);
      setIsProcessing(false);
      if (response) setProgress(PROGRESS_STATUSES.RECIEPT);
    } catch (err) {
      alert("Some error occurred during adding new record !!");
      console.log(err);
      setIsProcessing(false);
    }
  }

  async function printReceipt() {
    print("recordReceipt", "newRecordReceipt");
  }

  if (!auth.loggedIn) return <Redirect to="/login/hospital" />;
  return (
    <HospitalDashboardContainer>
      {modalState && <Backdrop onClick={() => setModalState(false)} />}
      {modalState && (
        <ModalUpload
          closeModal={closeModal}
          uploadedFiles={uploadedFiles}
          uploadFileHandler={uploadFileHandler}
        />
      )}
      <Left>
        <NavMenuList>
          <ListItems>
            <Navlink to="/hospitalDashboard">
              <div>
                <Dashboard />
              </div>
              <div>
                <Nbsp />
                Dashboard
              </div>
            </Navlink>
          </ListItems>
          <ListItemsActive>
            <NavlinkActive to="/newRecord">
              <div>
                <AddNewRecordLogo />
              </div>
              <div>
                <Nbsp />
                Add New Record
              </div>
            </NavlinkActive>
          </ListItemsActive>
          <ListItems>
            <Navlink to="/declinedRecords">
              <div>
                <DeclineLogo
                  style={{ width: "15px", height: "15px", marginRight: "5px" }}
                />
              </div>
              <div>
                <Nbsp />
                Declined Records
              </div>
            </Navlink>
          </ListItems>
          <ListItems>
            <Navlink onClick={auth.logout} to="">
              <div>
                <LogoutLogo />
              </div>
              <div>
                {" "}
                <Nbsp />
                Logout
              </div>
            </Navlink>
          </ListItems>
          <ListItems>
            <Navlink to="">
              <div>
                <SettingsLogo />
              </div>
              <div>
                <Nbsp />
                Settings
              </div>
            </Navlink>
          </ListItems>
        </NavMenuList>
        <Note>
          <NotesDiv>
            <NoteTitle>
              Note
              <Nbsp />:
              <Nbsp />
            </NoteTitle>
            <NoteDescription>
              Admin must strictly verify the revelant doucments during the
              registration process
            </NoteDescription>
          </NotesDiv>
        </Note>
      </Left>

      <Center>
        {progress === PROGRESS_STATUSES.PATIENT_ADDRESS ? (
          <KeyInputs
            submitInput={processKeyToDetails}
            isProcessingInput={isProcessing}
          />
        ) : progress === PROGRESS_STATUSES.RECORD_DETAILS ? (
          <>
            <Heading>New record details</Heading>
            <InputContainer>
              <InputSubContainer>
                <TextField
                  label="Name"
                  disabled
                  value={basicPatientInfo.name}
                />
                <TextField
                  label="Diease"
                  required
                  value={disease}
                  onChange={(e) => setDisease(e.target.value)}
                />
                <TextField
                  label="Dr. Name"
                  required
                  value={drname}
                  onChange={(e) => setDrname(e.target.value)}
                />
                <TextField
                  label="Hospital Record ID"
                  required
                  value={hospitaRecordlID}
                  onChange={(e) => setHospitaRecordlID(e.target.value)}
                />
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    value={diagnoseDate}
                    onChange={setDiagnoseDate}
                    maxDate={new Date()}
                    required
                    label="Diagnose date"
                    renderInput={(params) => <TextField {...params} />}
                  />
                </LocalizationProvider>
              </InputSubContainer>
              <InputSubContainer>
                <TextField label="DOB" disabled value={basicPatientInfo.dob} />
                <TextField
                  label="Treatment"
                  required
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                />
                <TextField
                  label="Medication"
                  required
                  multiline
                  rows={2}
                  value={medication}
                  onChange={(e) => setMedication(e.target.value)}
                />
                <div>
                  Was Patient Admited ?
                  <Checkbox
                    required
                    checked={wasAdmitted}
                    onChange={(e) => setWasAdmitted(e.target.checked)}
                  />
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      value={dischargeDate}
                      onChange={setDischargeDate}
                      maxDate={new Date()}
                      disabled={!wasAdmitted}
                      required
                      label="Discharge date"
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </LocalizationProvider>
                  <br />
                </div>
              </InputSubContainer>
            </InputContainer>
            <Buttons>
              <CoreButton
                onClick={uploadClickHandler}
                background="#387ED1"
                disabled={isUploading}
              >
                <UploadLogo /> 
                {isUploading ? "Uploading..." : "Upload reports"}
              </CoreButton>
              <CoreButton
                disabled={isProcessing || isUploading}
                onClick={!isProcessing ? validateInformation : null}
                background="#38D147"
              >
                {isProcessing ? "Processing..." : "Proceed"}
              </CoreButton>
            </Buttons>
          </>
        ) : progress === PROGRESS_STATUSES.CONFIRM ? (
          <>
            <Confirm>
              <HeadingDiv>
                <ConfirmHeading>Confirm Details : </ConfirmHeading>
              </HeadingDiv>
              <Details>
                <PatientCol>
                  <SubHeading>Patient Details:</SubHeading>
                  <DetailsDiv>
                    <EachDetail>
                      <LeftDetails>
                        <DetailsText>Name</DetailsText>
                      </LeftDetails>
                      <RightDetails>
                        <DetailsText>
                          :<Nbsp />
                          <Nbsp />
                          {basicPatientInfo.name}
                        </DetailsText>
                      </RightDetails>
                    </EachDetail>
                    <EachDetail>
                      <LeftDetails>
                        <DetailsText>Age</DetailsText>
                      </LeftDetails>
                      <RightDetails>
                        <DetailsText>
                          :<Nbsp />
                          <Nbsp />
                          {calculateAge(basicPatientInfo.dobTimeStamp)}
                        </DetailsText>
                      </RightDetails>
                    </EachDetail>
                    <EachDetail>
                      <LeftDetails>
                        <DetailsText>Gender</DetailsText>
                      </LeftDetails>
                      <RightDetails>
                        <DetailsText>
                          :<Nbsp />
                          <Nbsp />
                          {basicPatientInfo.gender}
                        </DetailsText>
                      </RightDetails>
                    </EachDetail>
                  </DetailsDiv>
                </PatientCol>
                <MedicalCol>
                  <SubHeadingMedical>Medical Details:</SubHeadingMedical>
                  <DetailsDiv>
                    <EachDetail>
                      <LeftDetailsMedical>
                        <DetailsText>Disease</DetailsText>
                      </LeftDetailsMedical>
                      <RightDetailsMedical>
                        <DetailsText>
                          :<Nbsp />
                          <Nbsp />
                          {disease}
                        </DetailsText>
                      </RightDetailsMedical>
                    </EachDetail>
                    <EachDetail>
                      <LeftDetailsMedical>
                        <DetailsText>Treatment</DetailsText>
                      </LeftDetailsMedical>
                      <RightDetailsMedical>
                        <DetailsText>
                          :<Nbsp />
                          <Nbsp />
                          {treatment}
                        </DetailsText>
                      </RightDetailsMedical>
                    </EachDetail>
                    <EachDetail>
                      <LeftDetailsMedical>
                        <DetailsText>Medication</DetailsText>
                      </LeftDetailsMedical>
                      <RightDetailsMedical>
                        <DetailsText>
                          :<Nbsp />
                          <Nbsp />
                          {medication}
                        </DetailsText>
                      </RightDetailsMedical>
                    </EachDetail>
                    <EachDetail>
                      <LeftDetailsMedical>
                        <DetailsText>Doctor Name</DetailsText>
                      </LeftDetailsMedical>
                      <RightDetailsMedical>
                        <DetailsText>
                          :<Nbsp />
                          <Nbsp />
                          {drname}
                        </DetailsText>
                      </RightDetailsMedical>
                    </EachDetail>
                    {uploadedFiles.length > 0 &&
                      <EachDetail>
                        <LeftDetailsMedical>
                          <DetailsText>Reports</DetailsText>
                        </LeftDetailsMedical>
                        <RightDetailsMedical>
                          <DetailsText>
                            :<Nbsp />
                            <Nbsp />
                            {uploadedFiles.length}{uploadedFiles.length === 1 ? ' file uploaded' : ' files uploaded'}
                          </DetailsText>
                        </RightDetailsMedical>
                      </EachDetail>
                    }
                    <EachDetail>
                      <LeftDetailsMedical>
                        <DetailsText>Diagnosed Date</DetailsText>
                      </LeftDetailsMedical>
                      <RightDetailsMedical>
                        <DetailsText>
                          :<Nbsp />
                          <Nbsp />
                          {dateFromTimestamp(dateToTimestamp(diagnoseDate))}
                        </DetailsText>
                      </RightDetailsMedical>
                    </EachDetail>
                    {wasAdmitted && (
                      <EachDetail>
                        <LeftDetailsMedical>
                          <DetailsText>Discharge Date</DetailsText>
                        </LeftDetailsMedical>
                        <RightDetailsMedical>
                          <DetailsText>
                            :<Nbsp />
                            <Nbsp />
                            {dateFromTimestamp(dateToTimestamp(dischargeDate))}
                          </DetailsText>
                        </RightDetailsMedical>
                      </EachDetail>
                    )}
                  </DetailsDiv>
                </MedicalCol>
              </Details>
              <Buttons>
                <CoreButton
                  onClick={goBackToDetails}
                  disabled={isProcessing}
                  background="#F23F3F"
                >
                  <BackArrow /> &nbsp; Change
                </CoreButton>
                <CoreButton
                  disabled={isProcessing}
                  onClick={!isProcessing ? sendNewRecord : null}
                  background="#38D147"
                >
                  {isProcessing ? "Processing ...." : "Confirm"}
                </CoreButton>
              </Buttons>
            </Confirm>
          </>
        ) : progress === PROGRESS_STATUSES.RECIEPT ? (
          <div>
            <Preview id="newRecordReceipt">
              <center>
                <RecieptHeading>
                  New Record Successfully Created
                  <Nbsp />
                  <GreenTick />
                </RecieptHeading>
              </center>
              <RecieptContainer>
                <Reciept>
                  <RecieptDetails>
                    <ReceiptDetailHead>Details</ReceiptDetailHead>
                    <ReceiptDetailsBody>
                      <EachDetail>
                        <RecieptLeftDetail>Name</RecieptLeftDetail>
                        <RecieptRightDetail>
                          :<Nbsp />
                          <Nbsp />
                          {basicPatientInfo.name}
                        </RecieptRightDetail>
                      </EachDetail>
                      <EachDetail>
                        <RecieptLeftDetail>Diagnosis</RecieptLeftDetail>
                        <RecieptRightDetail>
                          :<Nbsp />
                          <Nbsp />
                          {disease}
                        </RecieptRightDetail>
                      </EachDetail>
                      <EachDetail>
                        <RecieptLeftDetail>Doctor</RecieptLeftDetail>
                        <RecieptRightDetail>
                          :<Nbsp />
                          <Nbsp />
                          {drname}
                        </RecieptRightDetail>
                      </EachDetail>
                    </ReceiptDetailsBody>
                  </RecieptDetails>
                  <RecieptQR>
                    <center>
                      <RecieptQrHead>
                        Scan this QR code to view the record
                      </RecieptQrHead>
                      <RecieptQrLogo>
                        <QRCode size={100} value="123" fgColor="#101010" />
                      </RecieptQrLogo>
                    </center>
                  </RecieptQR>
                </Reciept>
              </RecieptContainer>
            </Preview>
            <Buttons>
              <RecieptButton
                onClick={printReceipt}
                background="#ffde00"
                color="#202020"
              >
                Print Reciept
                <Nbsp />
                <Nbsp />
                <Nbsp />
                <Nbsp />
                <Nbsp />
                <PrintIcon />
              </RecieptButton>
              <RecieptButton
                onClick={(e) => props.history.push("/dashboard")}
                background="#ffde00"
                color="#202020"
              >
                Go to Dashboard
                <Nbsp />
                <Nbsp />
                <Nbsp />
                <Nbsp />
                <Nbsp />
                <HomeIcon />
              </RecieptButton>
            </Buttons>
          </div>
        ) : (
          "Something went wrong !!"
        )}
      </Center>
      <Right>
        <div>
          <center>
            <HospitalStyling>
              <HospitalLogo />
            </HospitalStyling>
          </center>
        </div>
        <div>
          <center>
            <Name>{hospitalInfo.name}</Name>
            <br />
            <TitleHosp>
              Hospital <TickMark />
            </TitleHosp>
            <br />
            <QRCode size={100} value={auth.wallet.address} fgColor="#101010" />
          </center>
        </div>
        <center>
          <HopitalCard>
            <HospCardHeading>
              <Circle>{getInitials(hospitalInfo.name)}</Circle>
              <HospitalCardName>{hospitalInfo.name}</HospitalCardName>
            </HospCardHeading>
            <HospCardDetails>
              <HospCardReg>
                <div>
                  Reg No.
                  <Nbsp />:
                  <Nbsp />
                </div>
                <div>
                  <Nbsp />
                  {hospitalInfo.govtLicenseNumber}
                </div>
              </HospCardReg>
              <HospCardAdd>
                <div>
                  Address
                  <Nbsp />:
                  <Nbsp />
                </div>
                <div>{hospitalInfo.Address}</div>
              </HospCardAdd>
            </HospCardDetails>
            <HospCardRow3>
              <FCName>FC Card</FCName>
            </HospCardRow3>
          </HopitalCard>
        </center>
      </Right>
    </HospitalDashboardContainer>
  );
};

export default NewRecord;