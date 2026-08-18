export { bankmall } from "./bankmall";
export { consultB2b } from "./consult-b2b";
export { financialCms } from "./financial-cms";
export { interior } from "./interior";
export { kwcag } from "./kwcag";
export { smartstore } from "./smartstore";
export { webpagePublishing } from "./webpage-publishing";
export { languageLearningApp } from "./language-learning-app";
export { yakal } from "./yakal";
export { reservationPlace } from "./reservation-place";
export { ownerbank } from "./ownerbank";
export { beautyAiChatbot } from "./beauty-ai-chatbot";
export { PLATFORM_FACETS, DOMAIN_FACETS } from "./facets";

import type { Project } from "../type";
import { bankmall } from "./bankmall";
import { consultB2b } from "./consult-b2b";
import { financialCms } from "./financial-cms";
import { interior } from "./interior";
import { kwcag } from "./kwcag";
import { smartstore } from "./smartstore";
import { webpagePublishing } from "./webpage-publishing";
import { languageLearningApp } from "./language-learning-app";
import { yakal } from "./yakal";
import { reservationPlace } from "./reservation-place";
import { ownerbank } from "./ownerbank";
import { beautyAiChatbot } from "./beauty-ai-chatbot";
import { moyobaOms } from "./moyoba-oms";
import { cluvit } from "./cluvit";
import { map } from "./map";
import { seasonal } from "./seasonal";
import { chatbot } from "./chatbot";
import { dreamhouse } from "./dreamhouse";
import { lms } from "./lms";

/** 포트폴리오 전체 목록 (표시 순서) */
export const PROJECTS: readonly Project[] = [
  cluvit,
  moyobaOms,
  seasonal,
  dreamhouse,
  lms,
  map,
  bankmall,
  consultB2b,
  financialCms,
  interior,
  kwcag,
  smartstore,
  chatbot,
  webpagePublishing,
  languageLearningApp,
  yakal,
  reservationPlace,
  ownerbank,
  beautyAiChatbot,
];
