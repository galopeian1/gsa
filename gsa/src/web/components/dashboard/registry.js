/* Copyright (C) 2018-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import Logger from 'gmp/log';

import {isDefined} from 'gmp/utils/identity';

const log = Logger.getLogger('web.components.dashboard.registry');
const registry = {};

export const registerDisplay = (displayId, component, {title}) => {
  if (!isDefined(displayId)) {
    log.error('Undefined id passed while registering display');
    return;
  }

  if (!isDefined(component)) {
    log.error(
      'Undefined component passed while registering display',
      displayId,
    );
    return;
  }

  if (!isDefined(title)) {
    log.error('Undefined title passed while registering display', displayId);
    return;
  }

  registry[displayId] = {
    component,
    title,
    displayId,
  };

  log.debug('Registered display', displayId);
};

export const getDisplay = displayId => registry[displayId];

// vim: set ts=2 sw=2 tw=80:
