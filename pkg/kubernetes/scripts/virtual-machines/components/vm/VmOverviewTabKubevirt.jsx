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

import type { Vm, Vmi, Message as MessageType, Pod } from '../../types.es6';
import { kindIdPrefx } from '../../utils.es6';
import { getLabels } from '../util/utils.jsx';
import { getNodeName, getMemory, getCPUs, getPhase, getAge } from '../../selectors.es6';
import { removeVmMessage } from '../../action-creators.es6';
import Message from '../common/Message.jsx';
import EntityLink from '../common/EntityLink.jsx';
import NodeLink from '../common/NodeLink.jsx';

const VmOverviewTabKubevirt = ({ vm, vmi, message, onMessageDismiss, pod, showState }: { vm: Vm, vmi: Vmi, message: MessageType, pod: Pod, showState: boolean }) => {
    const idPrefix = kindIdPrefx(vm);

    const messageElem = (<Message idPrefix={idPrefix} message={message} onDismiss={onMessageDismiss} />);

    const memoryItem = {title: commonTitles.MEMORY, value: getMemory(vm), idPostfix: 'memory'};
    const vCpusItem = {title: commonTitles.CPUS, value: getCPUs(vm), idPostfix: 'vcpus'};
    const podItem = {title: _("Pod:"), value: (<EntityLink path='/l/pods' entity={pod} />), idPostfix: 'pod'};
    const vmiItem = {title: _("VM Instance:"), value: (<EntityLink path='/vmis' entity={vmi} />), idPostfix: 'vmi'};

    const nodeItem = {title: _("Node:"), value: (<NodeLink name={getNodeName(vmi)} />), idPostfix: 'node'};
    const labelsItem = {title: _("Labels:"), value: getLabels(vm), idPostfix: 'labels'};

    const items = showState ? [
        memoryItem,
        {title: _("State"), value: getPhase(vmi), idPostfix: 'state'},
        vCpusItem,
        nodeItem,
        vmiItem,
        labelsItem,
        {title: _("Age"), value: getAge(vm), idPostfix: 'age'},
        podItem,
    ] : [
        memoryItem,
        nodeItem,
        vCpusItem,
        labelsItem,
        vmiItem,
        podItem,
    ];

    return (<VmOverviewTab message={messageElem}
                           idPrefix={idPrefix}
                           items={items} />);
};

export default connect(
    () => ({ }),
    (dispatch, { vm }) => ({
        onMessageDismiss: () => dispatch(removeVmMessage({ vm })),
    }),
)(VmOverviewTabKubevirt);
