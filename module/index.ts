/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {
  Rule,
  SchematicContext,
  SchematicsError,
  Tree,
  apply,
  branchAndMerge,
  chain,
  filter,
  mergeWith,
  move,
  noop,
  normalizePath,
  template,
  url,
} from '@angular-devkit/schematics';
import * as ts from 'typescript';
import * as stringUtils from '../strings';
import { addImportToModule } from '../utility/ast-utils';
import { InsertChange } from '../utility/change';
import { buildRelativePath, findModuleFromOptions } from '../utility/find-module';
import { Schema as ModuleOptions } from './schema';


function addDeclarationToNgModule(options: ModuleOptions): Rule {
  return (host: Tree) => {
    if (!options.module) {
      return host;
    }

    const modulePath = options.module;

    const text = host.read(modulePath);
    if (text === null) {
      throw new SchematicsError(`File ${modulePath} does not exist.`);
    }
    const sourceText = text.toString('utf-8');
    const source = ts.createSourceFile(modulePath, sourceText, ts.ScriptTarget.Latest, true);

    const importModulePath = `/${options.sourceDir}/${options.path}/`
                     + (options.flat ? '' : stringUtils.dasherize(options.name) + '/')
                     + stringUtils.dasherize(options.name)
                     + '.module';
    const relativePath = buildRelativePath(modulePath, importModulePath);
    const changes = addImportToModule(source, modulePath,
                                      stringUtils.classify(`${options.name}Module`),
                                      relativePath);

    const recorder = host.beginUpdate(modulePath);
    for (const change of changes) {
      if (change instanceof InsertChange) {
        recorder.insertLeft(change.pos, change.toAdd);
      }
    }
    host.commitUpdate(recorder);

    return host;
  };
}

export default function (options: ModuleOptions): Rule {
  options.path = options.path ? normalizePath(options.path) : options.path;
  const sourceDir = options.sourceDir;
  if (!sourceDir) {
    throw new SchematicsError(`sourceDir option is required.`);
  }

  return (host: Tree, context: SchematicContext) => {
    if (options.module) {
      options.module = findModuleFromOptions(host, options);
    }

    const templateSource = apply(url('./files'), [
      options.spec ? noop() : filter(path => !path.endsWith('.spec.ts')),
      options.routing ? noop() : filter(path => !path.endsWith('-routing.module.ts')),
      template({
        ...stringUtils,
        'if-flat': (s: string) => options.flat ? '' : s,
        ...options as object,
      }),
      move(sourceDir),
    ]);

    return chain([
      branchAndMerge(chain([
        addDeclarationToNgModule(options),
        mergeWith(templateSource),
      ])),
    ])(host, context);
  };
}
