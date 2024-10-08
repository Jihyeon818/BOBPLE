import '../../assets/style/components/ChattingModal.css';
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import {Calculator, CloseIcon} from "../imgcomponents/ImgComponents";

const ChattingModal = ({ modalState, hideModal, chatRoomId, chatRoomTitle, chatRoomPeople, toggleTheme }) => {
    const [participants, setParticipants] = useState([]);
    const [currentUserRole, setCurrentUserRole] = useState(null);
    const [location, setLocation] = useState("");  // 채팅방 위치 저장
    const [currentParticipants, setCurrentParticipants] = useState(0);  // 현재 참여 인원 수 저장
    const navigate = useNavigate();

    useEffect(() => {
        const fetchChatRoomData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error('No JWT token found');
                    return;
                }

                // 현재 유저 정보 가져오기
                const userResponse = await axios.get('http://localhost:8080/api/users/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const userIdx = userResponse.data.userIdx;

                // 해당 채팅방 정보 가져오기
                const chatRoomResponse = await axios.get(`http://localhost:8080/api/chatrooms/${chatRoomId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                setLocation(chatRoomResponse.data.location);  // location 정보 설정
                setCurrentParticipants(chatRoomResponse.data.currentParticipants);  // 현재 참여 인원 설정

                // 해당 채팅방 참여자 정보 가져오기
                const participantsResponse = await axios.get(`http://localhost:8080/api/chatrooms/${chatRoomId}/participants`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                // 차단된 참여자들을 제외
                const activeParticipants = participantsResponse.data.filter(participant => participant.status !== 'DENIED');
                setParticipants(activeParticipants);

                // 현재 유저의 역할 가져오기
                const roleResponse = await axios.get(`http://localhost:8080/api/chatrooms/${chatRoomId}/role`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    params: {
                        userIdx
                    }
                });

                console.log('Current User Role:', roleResponse.data.role); // 콘솔에 현재 유저의 역할 출력
                setCurrentUserRole(roleResponse.data.role);

            } catch (error) {
                console.error('Failed to fetch chat room data or user role', error);
            }
        };

        fetchChatRoomData();
    }, [chatRoomId]);

    const closeModal = () => {
        setTimeout(() => {
            hideModal();
        }, 500);
    };

    const moveCal = () => {
        navigate('/myPage/calculator');
    };

    const handleBlockUser = async (userId, userName) => {
        const confirmed = window.confirm(`${userName}님을 차단하시겠습니까?\n차단하면 차단한 사용자는 다시 현재 채팅방에 들어올 수 없습니다.`);
        if (confirmed) {
            try {
                const token = localStorage.getItem('token');
                await axios.post(`http://localhost:8080/api/chatrooms/${chatRoomId}/block`, null, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    params: {
                        userId
                    }
                });
                setParticipants(prevParticipants => prevParticipants.filter(participant => participant.userId !== userId));
                alert(`${userName}님이 차단되었습니다.`);
            } catch (error) {
                console.error('Failed to block user', error);
            }
        }
    };

    const handleLeaveChatRoom = async () => {
        const confirmed = window.confirm('채팅방을 나가시겠어요?');
        if (confirmed) {
            try {
                const token = localStorage.getItem('token');
                const userIdx = localStorage.getItem('userIdx');

                // 사용자를 채팅방에서 제거
                await axios.delete(`http://localhost:8080/api/chatrooms/${chatRoomId}/leave`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    params: {
                        userIdx
                    }
                });

                alert('채팅방을 나갔습니다.');
                closeModal();
                navigate('/group');
            } catch (error) {
                console.error('Failed to leave chat room', error);
                alert('채팅방 나가기에 실패했습니다.');
            }
        }
    };

    const handleDeleteChatRoom = async () => {
        const confirmed = window.confirm('정말 이 채팅방을 삭제하시겠습니까? 모든 데이터가 삭제됩니다.');
        if (confirmed) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:8080/api/chatrooms/${chatRoomId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                alert('채팅방이 삭제되었습니다.');
                closeModal();
                navigate('/group');
            } catch (error) {
                console.error('Failed to delete chat room', error);
            }
        }
    };

    return (
        <div className={`modal ${modalState}`}>
            <div className="modal-content chatting">
                <button onClick={closeModal} className="chatting-modal-close-btn">
                    <CloseIcon/>
                </button>
                <div className="chatRoom-header">
                    <h4 className="chatRoom-title">{chatRoomTitle}</h4>
                </div>
                <div className="chatRoom-info">
                    <h5>모집 장소 : {location}</h5>  {/* 모집 장소 표시 */}
                </div>
                <h5 className="chatRoom-people">인원 {currentParticipants} / {chatRoomPeople}</h5>
                <div className="participants-list">
                    {participants.length > 0 ? (
                        participants.map((participant) => (
                            <div key={participant.userId}
                                 className={`participant-item ${participant.role === 'LEADER' ? 'leader' : ''}`}>
                                <img src={participant.profileImage} alt={`${participant.name}'s profile`}
                                     className="participant-image"/>
                                <span>{participant.name}</span>
                                {currentUserRole === 'LEADER' && participant.role !== 'LEADER' && (
                                    <button className="block-button"
                                            onClick={() => handleBlockUser(participant.userId, participant.name)}>⚠ 차단</button>
                                )}
                            </div>
                        ))
                    ) : (
                        <p>No participants found</p>
                    )}
                </div>

                <div className="chatRoom-footer">
                    <button onClick={moveCal} className="cal-btn"><Calculator/> 정산하기️</button>
                    <div className="chatRoom-out">
                        <button onClick={handleLeaveChatRoom} className="chatting-close-btn">나가기 <span>⇲</span></button>
                        {currentUserRole === 'LEADER' && (
                            <button className="delete-btn" onClick={handleDeleteChatRoom}>삭제</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

ChattingModal.propTypes = {
    modalState: PropTypes.string.isRequired,
    hideModal: PropTypes.func.isRequired,
    chatRoomId: PropTypes.number.isRequired,
    chatRoomTitle: PropTypes.string.isRequired,
    chatRoomPeople: PropTypes.number.isRequired,
};

export default ChattingModal;
