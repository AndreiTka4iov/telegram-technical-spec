export interface getRecognitionResult {
  sessionUuid: sessionUuid;
  audioCursors: audioCursorss;
  responseWallTimeMs: string;
  channelTag: string;

  partial?: partial;
  final?: final;
  eouUpdate?: eouUpdate;
  finalRefinement?: finalRefinement;
  statusCode?: statusCode;
  classifierUpdate?: classifierUpdate;
  speakerAnalysis?: speakerAnalysis;
  conversationAnalysis?: conversationAnalysis;
}

export interface partial extends BaseResult {}
export interface final extends BaseResult {}

export interface eouUpdate {
  timeMs: string;
}

export interface finalRefinement {
  finalIndex: string;
  normalizedText: normalizedText;
}

export interface statusCode {
  codeType: string;
  message: string;
}

export interface classifierUpdate extends timeMs {
  windowType: string;
  classifierResult: classifierResult;
}

export interface speakerAnalysis {
  speakerTag: string;
  windowType: string;

  speechBoundaries: timeMs;
  totalSpeechMs: string;
  speechRatio: number;
  totalSilenceMs: string;
  silenceRatio: number;

  wordsCount: string;
  lettersCount: string;

  wordsPerSecond: per;
  lettersPerSecond: per;
  wordsPerUtterance: per;
  lettersPerUtterance: per;
  utteranceCount: string;
  utteranceDurationEstimation: per;
}

export interface conversationAnalysis {
  conversationBoundaries: timeMs;
  totalSimultaneousSilenceDurationMs: string;
  totalSimultaneousSilenceRatio: number;
  simultaneousSilenceDurationEstimation: per;
  totalSimultaneousSpeechDurationMs: string;
  totalSimultaneousSpeechRatio: number;
  simultaneousSpeechDurationEstimation: per;
  speakerInterrupts: speakerInterrupts[];
  totalSpeechDurationMs: string;
  totalSpeechRatio: number;
}

export interface normalizedText extends BaseResult {}

export interface sessionUuid {
  uuid: string;
  userRequestId: string;
}

export interface audioCursorss {
  receivedDataMs: string;
  resetTimeMs: string;
  partialTimeMs: string;
  finalTimeMs: string;
  finalIndex: string;
  eouTimeMs: string;
}

export interface BaseResult {
  alternatives: alternatives[];
  channelTag: string;
}

export interface alternatives extends words {
  words: words[];
  confidence: number;
  languages: languages[];
}

interface timeMs {
  startTimeMs: string;
  endTimeMs: string;
}

export interface words extends timeMs {
  text: string;
}

export interface languages {
  languageCode: string;
  probability: number;
}

export interface classifierResult {
  classifier: string;
  highlights: words[];
  labels: label[];
}

export interface label {
  label: string;
  confidence: number;
}

export interface per {
  min: number;
  max: number;
  mean: number;
  std: number;
  quantiles: quantile[];
}

export interface quantile {
  level: number;
  value: number;
}

export interface speakerInterrupts {
  speakerTag: string;
  interruptsCount: string;
  interruptsDurationMs: string;
  interrupts: timeMs[];
}
