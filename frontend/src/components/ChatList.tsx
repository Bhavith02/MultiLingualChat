import {
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  Typography,
  Box,
  Divider,
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { formatDistanceToNow } from 'date-fns';
import AddIcon from '@mui/icons-material/Add';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';

interface ChatListProps {
  onConnectClick: () => void;
}

export default function ChatList({ onConnectClick }: ChatListProps) {
  const navigate = useNavigate();
  const { chatRooms, activeRoomId, user } = useStore();

  const getDisplayName = (room: typeof chatRooms[0]) => {
    if (room.name) return room.name;
    
    // For direct chats, show other participant's name
    const otherParticipant = room.participants?.find(p => p?.id !== user?.id);
    return otherParticipant?.displayName || otherParticipant?.username || 'Unknown';
  };

  return (
    <Box>
      <Box sx={{
        p: 2.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 20%)',
      }}>
        <Typography variant="h6" fontWeight="bold" sx={{ color: '#2d3748' }}>
          Chats
        </Typography>
        <IconButton
          size="small"
          onClick={onConnectClick}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
            }
          }}
        >
          <AddIcon />
        </IconButton>
      </Box>
      <Divider />
      <List sx={{ p: 0 }}>
        {chatRooms.map((room) => (
          <ListItem key={room.id} disablePadding>
            <ListItemButton
              selected={activeRoomId === room.id}
              onClick={() => navigate(`/dashboard/${room.id}`)}
              sx={{
                py: 2,
                px: 2.5,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(102, 126, 234, 0.08)',
                },
                '&.Mui-selected': {
                  bgcolor: 'rgba(102, 126, 234, 0.12)',
                  borderLeft: '4px solid',
                  borderColor: 'primary.main',
                  '&:hover': {
                    bgcolor: 'rgba(102, 126, 234, 0.15)',
                  }
                }
              }}
            >
              <ListItemAvatar>
                <Badge
                  badgeContent={room.unreadCount}
                  color="error"
                  overlap="circular"
                >
                  <Avatar sx={{
                    bgcolor: 'primary.main',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                    width: 48,
                    height: 48,
                  }}>
                    {room.type === 'group' ? <GroupIcon /> : <PersonIcon />}
                  </Avatar>
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography fontWeight={room.unreadCount > 0 ? 'bold' : 'normal'}>
                    {getDisplayName(room)}
                  </Typography>
                }
                secondary={
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      noWrap
                      sx={{ maxWidth: 200 }}
                    >
                      {room.lastMessage?.text || 'No messages yet'}
                    </Typography>
                    {room.lastMessage && (
                      <Typography variant="caption" color="text.secondary">
                        {formatDistanceToNow(new Date(room.lastMessage.timestamp), {
                          addSuffix: true,
                        })}
                      </Typography>
                    )}
                  </Box>
                }
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
