/** Ô chọn tệp: bấm để chọn hoặc kéo thả. Trạng thái do app/dropzone-flow.js cập nhật. */
import {ico} from './icons.js';

export const ACCEPT = 'application/pdf,image/png,image/jpeg';

export const dropzone = id => `<label class="dropzone" for="${id}" data-drop="${id}"><input id="${id}" name="file" type="file" accept="${ACCEPT}" class="sr-only" data-dropzone>
  <span class="dropzone-icon">${ico('upload', 24)}</span><span class="dropzone-text"><strong data-drop-title>Chọn tệp hoặc kéo thả vào đây</strong><small data-drop-hint>PDF, PNG hoặc JPG, tối đa 10 MB</small></span><span class="btn btn-soft" data-drop-button>Chọn tệp</span></label>`;
