import React from "react"
import { Box, Button, Container, Paper, Typography } from "@material-ui/core"
import "fontsource-roboto"
import { urlRoot, key } from "./constants"

function App() {

    const [message, setMessage] = React.useState("")
    const [currentState, setCurrentState] = React.useState("")
    const [buttonLabel, setButtonLabel] = React.useState("down")
    const [buttonDisabled, setButtonDisabled] = React.useState(false)
    const [finished, setFinished] = React.useState(true)
    const [stopDisabled, setStopDisabled] = React.useState(true)

    const delay = ms => new Promise(res => setTimeout(res, ms))

    const handleButtonPress = async () => {
        if (currentState == "up") {
            postNewState("down")
        }
        else if (currentState == "down") {
            postNewState("up")
        }
        setMessage("Changing...")
        setButtonDisabled(true)
        await delay(5000)
        setMessage("")
        setButtonDisabled(false)
    }

    const postNewState = (value) => {
        setStopDisabled(false)
        setFinished(false)
        const formData = new FormData()
        formData.append("state", value)
        fetch(urlRoot + "postState.php?key=" + key, {
            method: "POST",
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                Promise.reject("Error with the POST request")
            }
            else {
                return response.json()
            }
        })
        .then(json => {
            setFinished(json.finished)
            setCurrentState(json.state)
            setButtonLabel(json.state == "down" ? "up" : "down")
            setStopDisabled(true)
        })
        .catch(err => setMessage(err))
    }

    const getState = () => {
        fetch(urlRoot + "getState.php?key=" + key)
        .then(response => response.json())
        .then(json => {
            setFinished(json.finished)
            setCurrentState(json.state)
            setButtonLabel(json.state == "down" ? "up" : "down")
        })
        .catch(err => console.error(err))
    }

    const handleStop = () => {
        setStopDisabled(true)
        const formData = new FormData()
        formData.append("state", "stopped")
        fetch(urlRoot + "postState.php?key=" + key, {
            method: "POST",
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                Promise.reject("Error with the POST request")
            }
            else {
                return response.json()
            }
        })
        .then(json => {
            setCurrentState("down")
            setButtonLabel("up")
        })
    }

    React.useEffect( () => {
        getState()
    }, [])

    return (
        <Container>
            <Paper elevation={3}>
                <Box p={3}>
                    <Typography variant="h2">
                        Control the blinds
                    </Typography>
                    <Typography>
                        Current state: {currentState}
                    </Typography>
                    <Button variant="contained" onClick={handleButtonPress} disabled={buttonDisabled}>
                        {buttonLabel}
                    </Button>
                    <Button variant="contained" onClick={handleStop} disabled={stopDisabled}>
                        Stop
                    </Button>
                    <Typography variant="body1">
                        {message}
                    </Typography>
                </Box>
            </Paper>
        </Container>
    )
}

export default App;
