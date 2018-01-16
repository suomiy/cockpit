/*
 * This file is part of Cockpit.
 *
 * Copyright (C) 2017 Red Hat, Inc.
 *
 * Cockpit is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation; either version 2.1 of the License, or
 * (at your option) any later version.
 *
 * Cockpit is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Cockpit; If not, see <http://www.gnu.org/licenses/>.
 */

import cockpit from 'cockpit';
import React from 'react';

import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/selection/active-line';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import './createVmDialog.less';

import { preventDefault } from '../utils.jsx'

const _ = cockpit.gettext;

const MAX_IMPORT_FILE_SIZE_MIB = 50;

class CreateVmDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            resource: '',
            resourceError: null,
            filename: null,
            isDragging: false,
        };

        this.onDragEnter = this.onDragEnter.bind(this);
        this.onDragLeave = this.onDragLeave.bind(this);
        this.onDrop = this.onDrop.bind(this);
        this.onNewFile = this.onNewFile.bind(this);
        this.onNewFileEvent = this.onNewFileEvent.bind(this);

        this.onResourceChanged = this.onResourceChanged.bind(this);
    }

    onResourceChanged(value) {
        this.setState({ resource: value });
    }

    validate() {
        let success = true;
        let errors = {
            resourceError: null,
        };
        let result = {
            resource: null,
        };

        if (!this.state.resource) {
            errors.resourceError = _("VM definition is required.");
        } else {
            try {
                let res = JSON.parse(this.state.resource);
                if (res === null || typeof res !== "object") {
                    errors.resourceError = _("VM definition is not a valid JSON.");
                } else if (res instanceof Array) {
                    errors.resourceError = _("VM definition must be an object.");
                }else{
                    result.resource = res;
                }
            } catch (e) {
                errors.resourceError = _("VM definition is not a valid JSON.");
            }
        }

        for (const key in errors) {
            if (errors[key]) {
                success = false;
                break;
            }
        }

        return {
            success,
            errors,
            result,
        };
    }

    showErrors(errors) {
        this.setState(errors);
    }

    onNewFile(file) {
        if (file.size > MAX_IMPORT_FILE_SIZE_MIB * 1024 * 1024) {
            this.setState({
                resourceError: cockpit.format(_("Only files of size $0 MiB and less are supported"), MAX_IMPORT_FILE_SIZE_MIB),
            });
            return;
        }
        this.setState({ filename: file.name });
        let reader = new FileReader();
        reader.onload = (e) => this.setState({ resource: e.target.result });
        reader.readAsText(file);
    }

    onNewFileEvent(e) {
        if (e.target.files.length > 0) {
            this.onNewFile(e.target.files[0]);
        }
    }

    onDrop(e) {
        e.preventDefault();
        this.setState({ isDragging: false });
        const dt = e.dataTransfer;
        if (dt.items) {
            for (let i = 0; i < dt.items.length; i++) {
                if (dt.items[i].kind === "file") {
                    this.onNewFile(dt.items[i].getAsFile());
                    break;
                }
            }
        } else {
            if (dt.files.length > 0) {
                this.onNewFile(dt.files[0].getAsFile());
            }
        }
    }

    onDragEnter() {
        this.setState({ isDragging: true });
    }

    onDragLeave() {
        this.setState({ isDragging: false });
    }

    render() {
        let resourceErrorClassName = '';
        let resourceErrorLabel = null;

        if (this.state.resourceError) {
            resourceErrorClassName = 'has-error';
            resourceErrorLabel = (
                <label className="help-block" id='resource-text-error'>{this.state.resourceError}</label>);
        }

        let name = this.state.filename ||  _("No file selected");

        let dragOverlay = null;
        let emptyResourceOverlay = null;
        let containerClass = '';

        if (this.state.isDragging) {
            containerClass = 'disable-events';
            dragOverlay = (
                <div className="overlay drag-overlay drag-area">
                    <h1 className="centered-overlay drop-file">
                        <b>
                            {_("Drop file here")}
                        </b>
                    </h1>
                </div>
            );
        }

        if (!this.state.resource && !this.state.isDragging) {
            emptyResourceOverlay = (
                <div className="overlay resource-overlay  disable-events" id="resource-text-overlay">
                    <div className="centered-overlay">
                        <h1>
                            <div className="fa fa-upload"/>
                        </h1>
                        <h2 className="drag-drop-paste">
                            {_("Drag & Drop or Paste Here")}
                        </h2>
                        {_("Import by dragging and dropping or pasting file contents directly")}
                    </div>
                </div>
            );
        }
        return (
            <div className="modal-body modal-dialog-body-table drag-container"
                 onDragEnter={this.onDragEnter}
                 onDragLeave={this.onDragLeave}
                 onDragOver={preventDefault}
                 onDrop={this.onDrop}>
                {dragOverlay}
                <div className={containerClass}>
                    <label className="control-label" htmlFor="file" id="file-label">
                        {_("Import a JSON file or paste contents directly")}
                    </label>
                    <div className="evenly-spaced-table medium-margin-bottom">
                        <span className="evenly-spaced-cell">
                            <input id="filename" className="form-control no-right-border" type="text"
                                   readOnly="readonly" value={name}/>
                        </span>
                        <span className="evenly-spaced-table">
                            <label className="btn btn-default" id="file-button">
                                Browse<input id="file-input" type="file" className="hide"
                                             onChange={this.onNewFileEvent}/>
                            </label>
                        </span>
                    </div>
                    <div className={"form-group " + resourceErrorClassName} id="resource-text">
                        <CodeMirror
                            editorDidMount={editor => {
                                editor.focus();
                            }}
                            value={this.state.resource}
                            options={{
                                mode: 'application/json',
                                lineNumbers: true,
                                dragDrop: false,
                                autoCloseBrackets: true,
                                foldGutter: true,
                                gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
                                matchBrackets: true,
                                styleActiveLine: true,
                                viewportMargin: Infinity, // browsers search: always render the whole text (should be small)
                            }}
                            onBeforeChange={(editor, data, value) => {
                                this.onResourceChanged(value);
                            }}
                        />
                        {emptyResourceOverlay}
                        {resourceErrorLabel}
                    </div>
                </div>
            </div>
        );
    }
}

export default CreateVmDialog;
