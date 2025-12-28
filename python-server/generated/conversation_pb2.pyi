from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from collections.abc import Mapping as _Mapping
from typing import ClassVar as _ClassVar, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class ChatRequest(_message.Message):
    __slots__ = ("session_id", "audio_chunk", "session_init", "session_end")
    SESSION_ID_FIELD_NUMBER: _ClassVar[int]
    AUDIO_CHUNK_FIELD_NUMBER: _ClassVar[int]
    SESSION_INIT_FIELD_NUMBER: _ClassVar[int]
    SESSION_END_FIELD_NUMBER: _ClassVar[int]
    session_id: str
    audio_chunk: bytes
    session_init: SessionInit
    session_end: SessionEnd
    def __init__(self, session_id: _Optional[str] = ..., audio_chunk: _Optional[bytes] = ..., session_init: _Optional[_Union[SessionInit, _Mapping]] = ..., session_end: _Optional[_Union[SessionEnd, _Mapping]] = ...) -> None: ...

class SessionInit(_message.Message):
    __slots__ = ("sample_rate", "channels", "bits_per_sample", "language")
    SAMPLE_RATE_FIELD_NUMBER: _ClassVar[int]
    CHANNELS_FIELD_NUMBER: _ClassVar[int]
    BITS_PER_SAMPLE_FIELD_NUMBER: _ClassVar[int]
    LANGUAGE_FIELD_NUMBER: _ClassVar[int]
    sample_rate: int
    channels: int
    bits_per_sample: int
    language: str
    def __init__(self, sample_rate: _Optional[int] = ..., channels: _Optional[int] = ..., bits_per_sample: _Optional[int] = ..., language: _Optional[str] = ...) -> None: ...

class SessionEnd(_message.Message):
    __slots__ = ("reason",)
    REASON_FIELD_NUMBER: _ClassVar[int]
    reason: str
    def __init__(self, reason: _Optional[str] = ...) -> None: ...

class ChatResponse(_message.Message):
    __slots__ = ("session_id", "audio_chunk", "transcript_partial", "transcript_final", "text_response", "error", "audio_response")
    SESSION_ID_FIELD_NUMBER: _ClassVar[int]
    AUDIO_CHUNK_FIELD_NUMBER: _ClassVar[int]
    TRANSCRIPT_PARTIAL_FIELD_NUMBER: _ClassVar[int]
    TRANSCRIPT_FINAL_FIELD_NUMBER: _ClassVar[int]
    TEXT_RESPONSE_FIELD_NUMBER: _ClassVar[int]
    ERROR_FIELD_NUMBER: _ClassVar[int]
    AUDIO_RESPONSE_FIELD_NUMBER: _ClassVar[int]
    session_id: str
    audio_chunk: bytes
    transcript_partial: TranscriptPartial
    transcript_final: TranscriptFinal
    text_response: TextResponse
    error: ErrorResponse
    audio_response: AudioResponse
    def __init__(self, session_id: _Optional[str] = ..., audio_chunk: _Optional[bytes] = ..., transcript_partial: _Optional[_Union[TranscriptPartial, _Mapping]] = ..., transcript_final: _Optional[_Union[TranscriptFinal, _Mapping]] = ..., text_response: _Optional[_Union[TextResponse, _Mapping]] = ..., error: _Optional[_Union[ErrorResponse, _Mapping]] = ..., audio_response: _Optional[_Union[AudioResponse, _Mapping]] = ...) -> None: ...

class AudioResponse(_message.Message):
    __slots__ = ("audio_data", "format", "sample_rate")
    AUDIO_DATA_FIELD_NUMBER: _ClassVar[int]
    FORMAT_FIELD_NUMBER: _ClassVar[int]
    SAMPLE_RATE_FIELD_NUMBER: _ClassVar[int]
    audio_data: bytes
    format: str
    sample_rate: int
    def __init__(self, audio_data: _Optional[bytes] = ..., format: _Optional[str] = ..., sample_rate: _Optional[int] = ...) -> None: ...

class TranscriptPartial(_message.Message):
    __slots__ = ("text", "confidence")
    TEXT_FIELD_NUMBER: _ClassVar[int]
    CONFIDENCE_FIELD_NUMBER: _ClassVar[int]
    text: str
    confidence: float
    def __init__(self, text: _Optional[str] = ..., confidence: _Optional[float] = ...) -> None: ...

class TranscriptFinal(_message.Message):
    __slots__ = ("text", "confidence", "start_time_ms", "end_time_ms")
    TEXT_FIELD_NUMBER: _ClassVar[int]
    CONFIDENCE_FIELD_NUMBER: _ClassVar[int]
    START_TIME_MS_FIELD_NUMBER: _ClassVar[int]
    END_TIME_MS_FIELD_NUMBER: _ClassVar[int]
    text: str
    confidence: float
    start_time_ms: int
    end_time_ms: int
    def __init__(self, text: _Optional[str] = ..., confidence: _Optional[float] = ..., start_time_ms: _Optional[int] = ..., end_time_ms: _Optional[int] = ...) -> None: ...

class TextResponse(_message.Message):
    __slots__ = ("text", "is_final")
    TEXT_FIELD_NUMBER: _ClassVar[int]
    IS_FINAL_FIELD_NUMBER: _ClassVar[int]
    text: str
    is_final: bool
    def __init__(self, text: _Optional[str] = ..., is_final: bool = ...) -> None: ...

class ErrorResponse(_message.Message):
    __slots__ = ("code", "message")
    CODE_FIELD_NUMBER: _ClassVar[int]
    MESSAGE_FIELD_NUMBER: _ClassVar[int]
    code: str
    message: str
    def __init__(self, code: _Optional[str] = ..., message: _Optional[str] = ...) -> None: ...
