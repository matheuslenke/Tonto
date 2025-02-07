/********************************************************************************
 * Copyright (c) 2020 TypeFox and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/
import "sprotty-vscode-webview/css/sprotty-vscode.css";

import { Container } from "inversify";
import "reflect-metadata";
import { configureModelElement } from "sprotty";
import { SprottyDiagramIdentifier } from "sprotty-vscode-webview";
import { PaletteButton, SprottyLspEditStarter } from "sprotty-vscode-webview/lib/lsp/editing";
import { createTontoDiagramContainer } from "./di.config";
import { PaletteButtonView } from "./html-views";

export class TontoSprottyStarter extends SprottyLspEditStarter {

    protected override createContainer(diagramIdentifier: SprottyDiagramIdentifier) {
        return createTontoDiagramContainer(diagramIdentifier.clientId);
    }

    protected override addVscodeBindings(container: Container, diagramIdentifier: SprottyDiagramIdentifier): void {
        super.addVscodeBindings(container, diagramIdentifier);
        configureModelElement(container, "button:create", PaletteButton, PaletteButtonView);
    }
}

new TontoSprottyStarter().start();
