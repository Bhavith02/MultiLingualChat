import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Chip,
  Tooltip,
  Switch,
  FormControlLabel,
  Menu,
  MenuItem,
  ListItemText,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import TranslateIcon from '@mui/icons-material/Translate';
import SchoolIcon from '@mui/icons-material/School';
import { useStore } from '../store';
import { websocketService } from '../services/websocket';
import { chatAPI, userAPI } from '../services/api';
import { SUPPORTED_LANGUAGES } from '../utils/languages';
import type { Message } from '../types';
import { formatDistanceToNow } from 'date-fns';

export default function ChatWindow() {
  const { roomId } = useParams<{ roomId: string }>();
  const { 
    user, 
    chatRooms, 
    messages, 
    setActiveRoom, 
    setMessages, 
    typingUsers,
    languageLearningMode,
    toggleLanguageLearningMode,
    setUser,
  } = useStore();
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [langMenuAnchor, setLangMenuAnchor] = useState<null | HTMLElement>(null);
  const [langSearchQuery, setLangSearchQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recognitionRef = useRef<any>(null);

  const room = chatRooms.find((r) => r.id === Number(roomId));
  const roomMessages = messages[Number(roomId!) || 0] || [];
  const currentRoomTypingUsers = typingUsers[Number(roomId!) || 0] || [];

  useEffect(() => {
    setActiveRoom(Number(roomId));
    
    // Load messages from API
    if (roomId) {
      chatAPI.getMessages(Number(roomId))
        .then((response) => {
          if (response.success && response.data.messages) {
            const formattedMessages: Message[] = response.data.messages.map((msg: any) => ({
              id: msg.id,
              senderId: msg.senderId || msg.sender_id,
              senderName: msg.sender?.displayName || msg.sender?.username || 'Unknown',
              senderAvatar: msg.sender?.avatarUrl,
              text: msg.text, // Backend already sends translated text
              originalText: msg.originalText,
              originalLang: msg.originalLang,
              romanization: msg.romanization,
              isOriginal: msg.isOriginal,
              timestamp: msg.createdAt || msg.created_at,
            }));
            setMessages(Number(roomId), formattedMessages);
          }
        })
        .catch((error) => {
          console.error('Failed to load messages:', error);
        });
    }
    
    return () => setActiveRoom(null);
  }, [roomId, setActiveRoom, setMessages, user?.preferredLang]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [roomMessages]);

  const handleSend = () => {
    if (!inputText.trim() || !roomId) return;

    // Send via WebSocket
    websocketService.sendMessage(Number(roomId), inputText);
    
    // Stop typing indicator
    if (isTyping) {
      websocketService.stopTyping(Number(roomId));
      setIsTyping(false);
    }
    
    setInputText('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    
    // Handle typing indicator
    if (!isTyping && roomId) {
      websocketService.startTyping(Number(roomId));
      setIsTyping(true);
    }
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (roomId) {
        websocketService.stopTyping(Number(roomId));
        setIsTyping(false);
      }
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleLanguageChange = async (langCode: string) => {
    try {
      const response = await userAPI.updateMe({ preferredLang: langCode });
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        // Reload messages in new language
        if (roomId) {
          const messagesResponse = await chatAPI.getMessages(Number(roomId));
          if (messagesResponse.success && messagesResponse.data?.messages) {
            const formattedMessages: Message[] = messagesResponse.data.messages.map((msg: any) => ({
              id: msg.id,
              senderId: msg.senderId || msg.sender_id,
              senderName: msg.sender?.displayName || msg.sender?.username || 'Unknown',
              senderAvatar: msg.sender?.avatarUrl,
              text: msg.text,
              originalText: msg.originalText,
              originalLang: msg.originalLang,
              romanization: msg.romanization,
              isOriginal: msg.isOriginal,
              timestamp: msg.createdAt || msg.created_at,
            }));
            setMessages(Number(roomId), formattedMessages);
          }
        }
      }
      setLangMenuAnchor(null);
      setLangSearchQuery('');
    } catch (error) {
      console.error('Failed to update language:', error);
    }
  };

  const filteredLanguages = SUPPORTED_LANGUAGES.filter((lang) => {
    const query = langSearchQuery.toLowerCase();
    return lang.name.toLowerCase().includes(query) || 
           lang.nativeName.toLowerCase().includes(query) ||
           lang.code.toLowerCase().includes(query);
  });

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          setInputText((prev) => prev + finalTranscript);
        }
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  // Update recognition language when user's preferred language changes
  useEffect(() => {
    if (recognitionRef.current && user?.preferredLang) {
      recognitionRef.current.lang = user.preferredLang;
    }
  }, [user?.preferredLang]);

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please try Chrome, Edge, or Safari.');
      return;
    }
    
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.lang = user?.preferredLang || 'en';
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  if (!room) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}
      >
        <Typography color="text.secondary">Select a chat to start messaging</Typography>
      </Box>
    );
  }

  const getDisplayName = () => {
    if (room.name) return room.name;
    if (!room.participants || room.participants.length === 0) return 'Unknown';
    const otherParticipant = room.participants.find((p) => p?.id !== user?.id);
    return otherParticipant?.displayName || otherParticipant?.username || 'Unknown';
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Chat Header */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: 'white',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{
            bgcolor: 'primary.main',
            width: 44,
            height: 44,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
          }}>
            {getDisplayName()[0]}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#2d3748' }}>{getDisplayName()}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
              {room.type === 'group'
                ? `${room.participants?.length || 0} members`
                : room.participants?.find((p) => p?.id !== user?.id)?.isOnline
                ? '🟢 Online'
                : 'Offline'}
            </Typography>
          </Box>
        </Box>
        
        <Tooltip title="Language Learning Mode - Show both original and translated messages">
          <FormControlLabel
            control={
              <Switch
                checked={languageLearningMode}
                onChange={toggleLanguageLearningMode}
                icon={<SchoolIcon />}
                checkedIcon={<SchoolIcon />}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <SchoolIcon fontSize="small" />
                <Typography variant="caption">Learn Mode</Typography>
              </Box>
            }
          />
        </Tooltip>
      </Paper>

      {/* Messages Area */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          p: 3,
          bgcolor: '#f5f7fa',
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.02) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      >
        {roomMessages.map((message) => {
          const isOwn = message.senderId === user?.id;
          return (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                justifyContent: isOwn ? 'flex-end' : 'flex-start',
                mb: 2.5,
              }}
            >
              <Box sx={{ maxWidth: { xs: '85%', sm: '70%' } }}>
                {!isOwn && (
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1.5, fontWeight: 500 }}>
                    {message.senderName}
                  </Typography>
                )}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: isOwn ? 'primary.main' : 'white',
                    color: isOwn ? 'white' : 'text.primary',
                    borderRadius: 3,
                    boxShadow: isOwn ? '0 2px 8px rgba(102, 126, 234, 0.2)' : '0 2px 8px rgba(0,0,0,0.08)',
                    background: isOwn ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                  }}
                >
                  <Typography variant="body1">{message.text}</Typography>
                  
                  {/* Language Learning Mode - Show both original and translation */}
                  {languageLearningMode && message.originalText && message.originalText !== message.text && (
                    <Box
                      sx={{
                        mt: 1.5,
                        pt: 1.5,
                        borderTop: '1px solid',
                        borderColor: isOwn ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <SchoolIcon sx={{ fontSize: 14, opacity: 0.7 }} />
                        <Typography variant="caption" sx={{ opacity: 0.7, fontWeight: 600 }}>
                          Original Text:
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ opacity: 0.9, fontStyle: 'italic', mb: 1 }}>
                        {message.originalText}
                      </Typography>
                      
                      {/* Romanization for pronunciation practice - only for non-Latin scripts */}
                      {message.romanization && (
                        <>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5, mt: 1 }}>
                            <TranslateIcon sx={{ fontSize: 14, opacity: 0.7 }} />
                            <Typography variant="caption" sx={{ opacity: 0.7, fontWeight: 600 }}>
                              How to pronounce:
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ opacity: 0.85, fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                            {message.romanization}
                          </Typography>
                        </>
                      )}
                    </Box>
                  )}
                  
                  {/* Regular translation hint when NOT in learning mode */}
                  {!languageLearningMode && message.originalText && message.originalText !== message.text && (
                    <Tooltip title={`Original (${message.originalLang}): ${message.originalText}`}>
                      <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'help' }}>
                        <TranslateIcon sx={{ fontSize: 12, opacity: 0.7 }} />
                        <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.7rem' }}>
                          Translated
                        </Typography>
                      </Box>
                    </Tooltip>
                  )}
                  
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      mt: 0.5,
                      opacity: 0.7,
                    }}
                  >
                    {formatDistanceToNow(new Date(message.timestamp), {
                      addSuffix: true,
                    })}
                  </Typography>
                </Paper>
              </Box>
            </Box>
          );
        })}
        
        {/* Typing indicator */}
        {currentRoomTypingUsers.filter((id) => id !== user?.id).length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                bgcolor: 'white',
                borderRadius: 3,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Someone is typing...
              </Typography>
            </Paper>
          </Box>
        )}
        
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 0,
          display: 'flex',
          gap: 1.5,
          alignItems: 'flex-end',
          bgcolor: 'white',
          borderTop: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 -2px 8px rgba(0,0,0,0.05)',
        }}
      >
        <Chip
          icon={<TranslateIcon />}
          label={user?.preferredLang.toUpperCase()}
          size="small"
          onClick={(e) => setLangMenuAnchor(e.currentTarget)}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontWeight: 600,
            cursor: 'pointer',
            '& .MuiChip-icon': { color: 'white' },
            '&:hover': {
              background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
            }
          }}
        />
        <Menu
          anchorEl={langMenuAnchor}
          open={Boolean(langMenuAnchor)}
          onClose={() => {
            setLangMenuAnchor(null);
            setLangSearchQuery('');
          }}
          PaperProps={{
            sx: { maxHeight: 500, width: 320 }
          }}
        >
          <Box sx={{ p: 2, pb: 1, position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Search languages..."
              value={langSearchQuery}
              onChange={(e) => setLangSearchQuery(e.target.value)}
              autoFocus
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            />
          </Box>
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((lang) => (
                <MenuItem 
                  key={lang.code} 
                  onClick={() => handleLanguageChange(lang.code)}
                  selected={user?.preferredLang === lang.code}
                >
                  <ListItemText 
                    primary={lang.nativeName}
                    secondary={lang.name}
                  />
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>
                <ListItemText primary="No languages found" />
              </MenuItem>
            )}
          </Box>
        </Menu>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder="Type a message..."
          value={inputText}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          variant="outlined"
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              bgcolor: '#f5f7fa',
              '&:hover fieldset': {
                borderColor: 'primary.main',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main',
              },
            },
          }}
        />
        <Tooltip title={isRecording ? 'Stop recording' : 'Voice input'}>
          <IconButton
            onClick={toggleVoiceRecording}
            sx={{
              background: isRecording ? '#f44336' : 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)',
              color: 'white',
              transition: 'all 0.3s ease',
              animation: isRecording ? 'pulse 1.5s infinite' : 'none',
              '@keyframes pulse': {
                '0%': {
                  boxShadow: '0 0 0 0 rgba(244, 67, 54, 0.7)',
                },
                '70%': {
                  boxShadow: '0 0 0 10px rgba(244, 67, 54, 0)',
                },
                '100%': {
                  boxShadow: '0 0 0 0 rgba(244, 67, 54, 0)',
                },
              },
              '&:hover': {
                background: isRecording ? '#d32f2f' : 'linear-gradient(135deg, #185a9d 0%, #43cea2 100%)',
                transform: 'scale(1.05)',
              },
            }}
          >
            <MicIcon />
          </IconButton>
        </Tooltip>
        <IconButton
          onClick={handleSend}
          disabled={!inputText.trim()}
          sx={{
            background: !inputText.trim() ? 'grey.300' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: !inputText.trim() ? 'grey.300' : 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
              transform: 'scale(1.05)',
            },
            '&:disabled': {
              color: 'white',
            }
          }}
        >
          <SendIcon />
        </IconButton>
      </Paper>
    </Box>
  );
}
