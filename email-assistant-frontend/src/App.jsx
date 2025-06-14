import './App.css'
import {
    Container,
    Box,
    Typography
} from "@mui/material";

function App() {
    return (
        <Container>
            <Box className="glass-card">
                <Typography variant="h3" align="center" gutterBottom sx={{
                    color: '#fff', fontWeight: 700
                }}>
                    Email Reply Assistant 🤖
                </Typography>
            </Box>
        </Container>
    )
}

export default App
