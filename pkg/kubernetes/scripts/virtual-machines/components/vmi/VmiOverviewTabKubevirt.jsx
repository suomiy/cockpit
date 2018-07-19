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

// @flow
import React from 'react';
import { gettext as _ } from 'cockpit';
import { connect } from 'react-redux';

import VmOverviewTab, { commonTitles } from '../../../../../machines/components/vmOverviewTab.jsx';

import type { Vmi, Message as MessageType, Pod } from '../../types.jsx';
import { kindIdPrefx } from '../../utils.jsx';
import { getNodeName, getMemory, getCPUs, getPhase, getAge } from '../../selectors.jsx';
import { getLabels } from '../util/utils.jsx';
import {removeVmiMessage} from '../../action-creators.jsx';
import Message from '../common/Message.jsx';
import EntityLink from '../common/EntityLink.jsx';
import NodeLink from '../common/NodeLink.jsx';

const VmiOverviewTabKubevirt = ({ vmi, message, onMessageDismiss, pod, showState }: { vmi: Vmi, message: MessageType, pod: Pod, showState: boolean }) => {
    const idPrefix = kindIdPrefx(vmi);

    const messageElem = (<Message idPrefix={idPrefix} message={message} onDismiss={onMessageDismiss} />);

    const memoryItem = {title: commonTitles.MEMORY, value: getMemory(vmi), idPostfix: 'memory'};
    const vCpusItem = {title: commonTitles.CPUS, value: getCPUs(vmi), idPostfix: 'vcpus'};
    const podItem = {title: _("Pod:"), value: (<EntityLink path='/l/pods' entity={pod} />), idPostfix: 'pod'};
    const nodeItem = {title: _("Node:"), value: (<NodeLink name={getNodeName(vmi)} />), idPostfix: 'node'};
    const labelsItem = {title: _("Labels:"), value: getLabels(vmi), idPostfix: 'labels'};

    const items = showState ? [
        memoryItem,
        {title: _("State"), value: getPhase(vmi), idPostfix: 'state'},
        vCpusItem,
        nodeItem,
        podItem,
        labelsItem,
        {title: _("Age"), value: getAge(vmi), idPostfix: 'age'},
    ] : [
        memoryItem,
        nodeItem,
        vCpusItem,
        labelsItem,
        podItem,
    ];

    return (<VmOverviewTab message={messageElem}
                           idPrefix={idPrefix}
                           items={items} />);
};

export default connect(
    () => ({ }),
    (dispatch, { vmi }) => ({
        onMessageDismiss: () => dispatch(removeVmiMessage({ vmi })),
    }),
)(VmiOverviewTabKubevirt);
