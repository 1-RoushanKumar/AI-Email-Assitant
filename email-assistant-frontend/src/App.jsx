import './App.css'
import {
    Container,
    TextField,
    Typography,
    Box,
    FormControl,
    Select,
    InputLabel,
    MenuItem,
    Divider,
    Button
} from '@mui/material'

function App() {
    return (
        <Container>
            <Box className="glass-card">
                <Typography variant="h3" align="center" gutterBottom sx={{
                    color: '#fff', fontWeight: 700
                }}>
                    Email Reply Assistant 🤖
                </Typography>

                <Divider sx={{mb: 3, borderColor: 'rgba(255,255,255,0.3)'}}/>

                <TextField
                    fullWidth
                    multiline
                    rows={6}
                    variant="outlined"
                    label="Original Email Content"
                />

                <FormControl>
                    <InputLabel sx={{color: 'white'}}>Tone (Optional)</InputLabel>
                    <Select
                        label="Tone (Optional)"
                        sx={{color: 'white'}}
                        inputProps={{style: {color: 'white'}}}
                    >
                        <MenuItem value="">None</MenuItem>
                        <MenuItem value="Professional">Professional</MenuItem>
                        <MenuItem value="Casual">Casual</MenuItem>
                        <MenuItem value="Friendly">Friendly</MenuItem>
                    </Select>
                </FormControl>

                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{py: 1.5, fontWeight: 600}}
                >
                    Generate Reply
                </Button>

                <Box sx={{mt: 4}}>
                    <Typography variant="h5" color="lightgreen" gutterBottom>
                        Generated Reply
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={8}
                        variant="outlined"
                    />
                    <Button
                        variant="outlined"
                        sx={{mt: 2, fontWeight: 600, color: 'white', borderColor: 'white'}}
                    >
                        📋 Copy to Clipboard
                    </Button>
                </Box>
            </Box>
        </Container>
    )
}

export default App
