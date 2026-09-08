/**
 * proposal-editor 기능(feature) 공개 API.
 * 제안서 편집 화면(app/proposals/[id]/edit)이 이 배럴을 통해서만 내부를 참조한다.
 */
export { assignKeys, stripKeys } from './lib/keys';
export { Toolbar, type SaveStatus } from './ui/toolbar';
export { SectionRail } from './ui/section-rail';
export { SectionEditor, ProjectInfoEditor } from './ui/section-editors';
export { Eye, EyeOff, ExternalLink } from './ui/icons';
