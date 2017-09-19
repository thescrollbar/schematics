/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Tree, VirtualTree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/test';
import { createAppModule, getFileContent } from '../utility/test';
import { Schema as ModuleSchema } from './schema';


describe('Module Schematic', () => {
  const schematicRunner = new SchematicTestRunner('@schematics/angular');
  const defaultOptions: ModuleSchema = {
    name: 'foo',
    path: 'app',
    sourceDir: 'src',
    spec: true,
    module: undefined,
    flat: false,
  };

  let appTree: Tree;

  beforeEach(() => {
    appTree = new VirtualTree();
    appTree = createAppModule(appTree);
  });

  it('should create a module', () => {
    const options = { ...defaultOptions };

    const tree = schematicRunner.runSchematic('module', options, appTree);
    const files = tree.files;
    expect(files.indexOf('/src/app/foo/foo.module.spec.ts')).toBeGreaterThanOrEqual(0);
    expect(files.indexOf('/src/app/foo/foo.module.ts')).toBeGreaterThanOrEqual(0);
  });

  it('should import into another module', () => {
    const options = { ...defaultOptions, module: 'app.module.ts' };

    const tree = schematicRunner.runSchematic('module', options, appTree);
    const content = getFileContent(tree, '/src/app/app.module.ts');
    expect(content).toMatch(/import { FooModule } from '.\/foo\/foo.module'/);
    expect(content).toMatch(/imports: \[(.|\s)*FooModule(.|\s)*\]/m);
  });

  it('should createa routing module', () => {
    const options = { ...defaultOptions, routing: true };

    const tree = schematicRunner.runSchematic('module', options, appTree);
    const files = tree.files;
    expect(files.indexOf('/src/app/foo/foo.module.ts')).toBeGreaterThanOrEqual(0);
    expect(files.indexOf('/src/app/foo/foo-routing.module.ts')).toBeGreaterThanOrEqual(0);
    const moduleContent = getFileContent(tree, '/src/app/foo/foo.module.ts');
    expect(moduleContent).toMatch(/import { FooRoutingModule } from '.\/foo-routing.module'/);
    const routingModuleContent = getFileContent(tree, '/src/app/foo/foo-routing.module.ts');
    expect(routingModuleContent).toMatch(/RouterModule.forChild\(routes\)/);
  });

  it('should respect the spec flag', () => {
    const options = { ...defaultOptions, spec: false };

    const tree = schematicRunner.runSchematic('module', options, appTree);
    const files = tree.files;
    expect(files.indexOf('/src/app/foo/foo.module.ts')).toBeGreaterThanOrEqual(0);
    expect(files.indexOf('/src/app/foo/foo.module.spec.ts')).toEqual(-1);
  });

  it('should dasherize a name', () => {
    const options = { ...defaultOptions, name: 'TwoWord' };

    const tree = schematicRunner.runSchematic('module', options, appTree);
    const files = tree.files;
    expect(files.indexOf('/src/app/two-word/two-word.module.ts')).toBeGreaterThanOrEqual(0);
    expect(files.indexOf('/src/app/two-word/two-word.module.spec.ts')).toBeGreaterThanOrEqual(0);
  });
});
