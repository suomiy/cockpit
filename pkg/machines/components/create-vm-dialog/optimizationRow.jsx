/*
 * This file is part of Cockpit.
 *
 * Copyright (C) 2018 Red Hat, Inc.
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
import React from 'react';
import cockpit from 'cockpit';

import * as Select from "cockpit-components-select.jsx";

const _ = cockpit.gettext;

export const DEFAULT_PROFILE = "Default";
export const CPU_PROFILE = "CPU";
export const SERVER_PROFILE = "Server";

export const profiles = [DEFAULT_PROFILE, CPU_PROFILE, SERVER_PROFILE];

const OptimizationRow = ({ id, checked, profile, onCheckedChange, onProfileChange }) => {
    let profileSelect;
    if (checked) {
        profileSelect = (
            <tr>
                <td className="top">
                    <label className="control-label" htmlFor={id + "profile-select"}>
                            Optimization Profile
                    </label>
                </td>
                <td>
                    <Select.Select id={id + "profile-select"}
                           initial={profile}
                           onChange={onProfileChange}>
                        {
                            profiles.map((p) => (
                                <Select.SelectEntry data={p} key={p}>
                                    {_(p)}
                                </Select.SelectEntry>
                            ))
                        }
                    </Select.Select>
                </td>
            </tr>
        );
    }
    return (
        <React.Fragment>
            <tr>
                <td className="top">
                    <label className="control-label" htmlFor={id}>
                    Optimize
                    </label>
                </td>
                <td>
                    <input id={id}
                           type="checkbox"
                           checked={checked}
                           onChange={onCheckedChange} />
                </td>
            </tr>
            {profileSelect}
        </React.Fragment>
    );
};

export default OptimizationRow;
