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
    Button, CircularProgress
} from '@mui/material'

import axios from "axios";
import {useState} from "react";

function App() {

    const [emailContent, setEmailContent] = useState('')
    const [tone, setTone] = useState('')
    const [generatedReply, setGeneratedReply] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async () => {
        setLoading(true)
        setError('')
        try {
            const response = await axios.post('http://localhost:8080/api/email/generate', {
                emailContent,
                tone,
            })

            setGeneratedReply(typeof response.data === 'string' ? response.data : JSON.stringify(response.data))
        } catch (error) {
            setError('Failed to generate Email reply. Please try again later.')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const sharedFieldStyles = {
        backgroundColor: 'rgba(60, 211, 173, 0.15)',
        borderRadius: 2,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        '& .MuiOutlinedInput-root': {
            transition: 'all 0.25s ease-in-out',
            '& fieldset': {
                borderColor: 'rgba(255,255,255,0.3)',
            },
            '&:hover fieldset': {
                borderColor: '#4cb8c4',
            },
            '&.Mui-focused fieldset': {
                borderColor: '#3cd3ad',
            },
        },
    }

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
                    value={emailContent}
                    onChange={(e) => setEmailContent(e.target.value)}
                    sx={{mb: 3, ...sharedFieldStyles}}
                />

                <FormControl fullWidth sx={{mb: 3, ...sharedFieldStyles}}>
                    <InputLabel sx={{color: 'white'}}>Tone (Optional)</InputLabel>
                    <Select
                        value={tone}
                        label="Tone (Optional)"
                        sx={{color: 'white'}}
                        inputProps={{style: {color: 'white'}}}
                        onChange={(e) => setTone(e.target.value)}
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
                    onClick={handleSubmit}
                    disabled={!emailContent || loading}
                    fullWidth
                    sx={{py: 1.5, fontWeight: 600}}
                >
                    {loading ? <CircularProgress size={24} color="inherit"/> : 'Generate Reply'}
                </Button>

                {error && (
                    <Typography color="error" sx={{mt: 2}}>
                        {error}
                    </Typography>
                )}

                {generatedReply && (
                    <Box sx={{mt: 4}}>
                        <Typography variant="h5" color="lightgreen" gutterBottom>
                            Generated Reply
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={8}
                            variant="outlined"
                            value={generatedReply}
                            inputProps={{readOnly: true}}
                            sx={sharedFieldStyles}
                        />
                        <Button
                            variant="outlined"
                            sx={{mt: 2, fontWeight: 600, color: 'white', borderColor: 'white'}}
                            onClick={() => navigator.clipboard.writeText(generatedReply)}
                        >
                            📋 Copy to Clipboard
                        </Button>
                    </Box>
                )}
            </Box>
        </Container>
    )
}

export default App
