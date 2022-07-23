---
icon: edit
date: 2022-07-24
category:
  - raft
tag:
  - tag MapReduce
  - tag raft
star: true
---

# MapReduce 
6.824-2022 年春季

实验室 1 : MapReduce

截止日期：周五 2 月 11 日 23 : 59 （麻省理工时间）

协作政策 // 提交实验室 // 安装程序 Go // 指导 // 广场

**介绍**

在本实验中，您将构建一个 MapReduce 系统。 您将实现一个调用应用程序 Map 和 Reduce 函数并处理读取和写入文件的worker进程，以及一个将任务分发给  workers  并处理失败  workers  的协调进程。 您将构建类似于 [MapReduce 论文](http://research.google.com/archive/mapreduce-osdi04.pdf ) 的东西。 （注意：本实验室使用“coordinator”而不是论文里的“master”。）

 **入门**

您需要[设置 Go ](https://pdos.csail.mit.edu/6.824/labs/go.html)进行实验。

使用 git（版本控制系统）获取初始实验室软件。 要了解有关 git 的更多信息，请查看 [Pro Git 书籍](https://git-scm.com/book/en/v2)或 [git 用户手册](http://www.kernel.org/pub/software/scm/git/docs/user-manual.html)。
```
$ git clone git://g.csail.mit.edu/6.824-golabs-2022 6.824
$ cd 6.824
$ ls
Makefile src
$
```
我们在 ```src/main/mrsequential.go ```中为您提供了一个简单的顺序 mapreduce 实现。 它在单个进程中一次运行一个mpas和reduces。 我们还为您提供了几个 MapReduce 应用程序：```mrapps/wc.go``` 中的字数统计和 ```mrapps/indexer.go``` 中的文本索引器。 您可以按如下顺序运行字数统计：
```
$ cd ~/6.824
$ cd src/main
$ go build -race -buildmode=plugin ../mrapps/wc.go
$ rm mr-out*
$ go run -race mrsequential.go wc.so pg*.txt
$ more mr-out-0
A 509
ABOUT 2
ACT 8
```

（注意：**-race** 启用 Go 竞赛检测器。我们建议您使用竞赛检测器开发和测试您的 6.824 实验室代码。当我们对您的实验室进行评分时，我们不会使用竞赛检测器。然而，如果你的代码有竞争，即使没有竞争检测器，当我们测试它时它很有可能会失败。）
```mrsequential.go``` 将其输出保留在文件 ```mr-out-0``` 中。 输入来自名为 ```pg-xxx.txt```的文本文件。
可以随意从 ```mrsequential.go``` 借用代码。 您还应该查看 ```mrapps/wc.go``` 以了解 MapReduce 应用程序代码的样子。

**你的工作([中度/重度](https://pdos.csail.mit.edu/6.824/labs/guidance.html))**

你的工作是实现一个分布式 MapReduce，它由两个程序组成， coordinator 和 worker . 将只有一个coordinator进程，以及一个或多个并行执行的 worker 进程。 在一个真实的系统中， workers  会在一堆不同的机器上运行，但是对于这个实验，您将在一台机器上运行它们。  workers  将通过 RPC 与 coordinator 交谈。 每个 worker 进程都会向coordinator请求一项任务，从一个或多个文件中读取任务的输入，执行任务，并将任务的输出写入一个或多个文件。 coordinator应关注每一个 worker 如果其不能在合理的时间内（对于本实验，使用十秒）完成其任务，那就要将相同的任务交给不同的 worker 。
 coordinator 和 worker 的“main”例程在 `main/mrcoordinator.go`和 ```main/mrworker.go```； 不要更改这些文件。 你应该把你的实现放在 ```mr/coordinator.go```, ```mr/worker.go ```和 ```mr/rpc.go``` 中。
以下是在字数 MapReduce 应用程序上运行代码的方法。 首先，确保 word-count 插件是新构建的：
```
$ go build -race -buildmode=plugin ../mrapps/wc.go
```
在```主```目录中，运行coordinator。
```
$ rm mr-out*
$ go run -race mr coordinator.go pg-*.txt
```
```mrcoordinator .go``` 的 ```pg-*.txt``` 参数是输入文件； 每个文件对应一个“拆分”，是一个 Map 任务的输入。 ```-race``` 标志运行与其比赛检测器一起运行。
在一个或多个其他窗口中，运行一些 worker 程序：
```
$ go run -race mrworker.go wc.so
```
worker 和coordinator完成后，查看 ```mr-out-*``` 中的输出。 完成实验后，输出文件的排序并集应该与顺序输出匹配，如下所示：
```
$ cat mr-out-* | sort | more
A 509
ABOUT 2
ACT 8
```
我们在 ```main/test-mr.sh``` 中为您提供了一个测试脚本。 当给定 ```pg-xxx.txt``` 文件作为输入时，测试检查 wc 和索引器 MapReduce 应用程序是否产生正确的输出。 测试还检查您的实现是否并行运行 Map 和 Reduce 任务，以及您的实现是否从运行任务时崩溃的 worker 中恢复。
如果您现在运行测试脚本，它将挂起，因为coordinator 远不会完成：
```
$ cd ~/6.824/src/main
$ bash test-mr.sh
*** Starting wc test.
```
您可以在 ```mr/coordinator.go``` 的 Done 函数中将 ```ret := false``` 更改为 true，以便coordinator立即退出。 然后：
```
$ bash test-mr.sh
*** Starting wc test.
sort: No such file or directory
cmp: EOF on mr-wc-all
--- wc output is not the same as mr-correct-wc.txt
--- wc test: FAIL
$
```
测测试脚本希望在名为 ```mr-out-X``` 的文件中看到输出，每个 reduce 任务一个。 ```mr/coordinator .go``` 和 ```mr/worker.go``` 的空实现不会生成这些文件（或做很多其他事情），因此测试失败。
完成后，测试脚本输出应如下所示：
```
$ bash test-mr.sh
*** Starting wc test.
--- wc test: PASS
*** Starting indexer test.
--- indexer test: PASS
*** Starting map parallelism test.
--- map parallelism test: PASS
*** Starting reduce parallelism test.
--- reduce parallelism test: PASS
*** Starting crash test.
--- crash test: PASS
*** PASSED ALL TESTS
$
```
您还将看到 Go RPC 包中的一些错误，类似于
```
2019/12/16 13:27:09 rpc.Register: method "Done" has 1 input parameters; needs exactly three
```
忽略这些消息； 将coordinator注册为 [RPC 服务器](https://golang.org/src/net/rpc/server.go)检查其所有方法是否适用于 RPC（有 3 个输入）； 我们知道 ```Done``` 不是通过 RPC 调用的。

 **几条规则:**

 * map 阶段应该将中间 key 分成 ```nReduce``` reduce 任务的桶，其中 ```nReduce``` 是 reduce 任务的数量—— ```main/mrcoordinator.go``` 传递给 ```Makecoordinator()``` 的参数。因此，每个 mapper 都需要创建 ```nReduce``` 中间文件以供 reduce 任务使用。
 * worker 实现应该将第 X 个 reduce 任务的输出放在文件 ```mr-out-X``` 中。
 * ```mr-out-X``` 文件的每个 Reduce 函数输出应包含一行。 该行应使用 Go ```"%v %v"``` 格式生成，并使用键和值调用。 查看 ```main/mrsequential.go``` 中注释“这是正确格式”的行。 如果您的实现与此格式的偏差太大，测试脚本将失败。
 * 您可以修改 ```mr/worker.go、mr/coordinator.go``` 和 ```mr/rpc.go```。您可以临时修改其他文件进行测试，但请确保您的代码与原始版本兼容；我们将使用原始版本进行测试。
 * worker 应该将中间 Map 输出放在当前目录中的文件中，您的 worker 稍后可以将它们读取为 Reduce 任务的输入。
 * ```main/mrcoordinator.go``` 期望 ```mr/coordinator.go``` 实现一个 ```Done()``` 方法，该方法在 MapReduce 作业完全完成时返回 true；此时，```mrcoordinator .go``` 将退出。
 * 当作业完全完成时，worker 进程应该退出。实现这一点的一个简单方法是使用 ```call()``` 的返回值：如果 workers 未能联系到coordinator，它可以假设 coordinator已经退出，因为工作已完成，因此 workers 也可以终止。根据您的设计，您可能还会发现有一个“请退出”coordinator可以分配给 workers 的伪任务很有帮助。

**提示**

 * [指导页面](https://pdos.csail.mit.edu/6.824/labs/guidance.html)有一些关于开发和调试的提示。
 * 开始的一种方法是修改 ```mr/worker.go``` 的 ```Worker()``` 以向coordinator发送 RPC 请求任务。然后修改coordinator以响应尚未启动的地图任务的文件名。然后修改 worker 以读取该文件并调用应用程序 Map 函数，如在 ```mrsequential.go``` 中。
 * 应用程序 Map 和 Reduce 函数在运行时使用 Go 插件包从名称以 ```.so``` 结尾的文件加载。
 * 如果您更改 ```mr/``` 目录中的任何内容，您可能必须重新构建您使用的任何 MapReduce 插件，例如 ```go build -race -buildmode=plugin ../mrapps/wc.go```
 * 该实验室依赖于共享文件系统的 workers 。当所有 workers 在同一台机器上运行时，这很简单，但如果 workers 在不同机器上运行，则需要像 GFS 这样的全局文件系统。
 * 中间文件的合理命名约定是 ```mr-X-Y```，其中 X 是 Map 任务号，Y 是 reduce 任务号。
 * worker 的 map 任务代码需要一种在文件中存储中间键/值对的方法，这种方法可以在 reduce 任务期间正确读回。一种可能性是使用 Go 的 ```encoding/json``` 包。要将 JSON 格式的键/值对写入打开的文件：
```
 enc := json.NewEncoder(file)
  for _, kv := ... {
    err := enc.Encode(&kv)
```
并读取这样的文件:  
```
dec := json.NewDecoder(file)
  for {
    var kv KeyValue
    if err := dec.Decode(&kv); err != nil {
      break
    }
    kva = append(kva, kv)
  }
```
 * 你的 worker 的 map 部分可以使用 ```ihash(key)``` 函数（在 ```worker.go``` 中）来选择给定键的 reduce 任务。
 * 您可以从 ```mrsequential.go``` 中借鉴一些代码，用于读取Map输入文件、对Map和Reduce之间的中间键/值对进行排序以及将 Reduce 输出存储在文件中。
 * coordinator，作为一个RPC server，会并发；不要忘记锁定共享数据。
 * 使用 Go 的竞赛检测器，带有 ```go build -race``` 和 ```go run -race. test-mr.sh ```默认使用竞赛检测器运行测试。
 * workers 有时需要等待，例如在最后一张地图完成之前，reduce 无法启动。一种可能性是 workers 定期向coordinator请求工作，在每个请求之间使用 ```time.Sleep()``` 睡觉。另一种可能性是coordinator中的相关 RPC 处理程序具有等待的循环，使用 ```time.Sleep()``` 或 ```sync.Cond```。 Go 在自己的线程中为每个 RPC 运行处理程序，因此一个处理程序正在等待这一事实不会阻止coordinator处理其他 RPC。
 * coordinator无法可靠地区分崩溃的 workers 、存活但由于某种原因停止的 workers 以及正在执行但速度太慢而无法使用的 workers 。您能做的最好的事情是让coordinator等待一段时间，然后放弃并将任务重新发布给其他 workers 。对于本实验，让coordinator等待十秒钟；之后，coordinator应该假设 workers 已经死亡（当然，它可能没有）。
 * 如果您选择实施备份任务（第 3.6 节），请注意我们测试您的代码在 workers 执行任务时不会安排无关任务而不会崩溃。备份任务只能安排在一段相对较长的时间（例如 10 秒）之后。
 * 要测试崩溃恢复，您可以使用 ```mrapps/crash.go``` 应用程序插件。它在 Map 和 Reduce 函数中随机退出。
 * 为了确保在出现崩溃时没有人观察到部分写入的文件，MapReduce 论文提到了使用临时文件并在完全写入后自动重命名它的技巧。您可以使用 ioutil.TempFile 创建一个临时文件并使用 os.Rename 自动重命名它。
 * ```test-mr.sh``` 在子目录 ```mr-tmp``` 中运行其所有进程，因此如果出现问题并且您想查看中间文件或输出文件，请查看那里。您可以临时修改 ```test-mr.sh``` 以在测试失败后```退出```，因此脚本不会继续测试（并覆盖输出文件）。
 * ```test-mr-many.sh``` 提供了一个基本脚本，用于在超时的情况下运行 ```test-mr.sh```（这是我们测试代码的方式）。它将运行测试的次数作为参数。您不应该并行运行多个 ```test-mr.sh``` 实例，因为coordinator将重用同一个套接字，从而导致冲突。
 * Go RPC 仅发送名称以大写字母开头的结构字段。子结构还必须具有大写的字段名称。
 * 当将一个指向回复结构的指针传递给 RPC 系统时，*reply 指向的对象应该是零分配的。 RPC 调用的代码应始终如下所示
```
  reply := SomeType{}
  call(..., &reply)
```
无需在通话前设置任何回复字段。 如果你不遵循这个要求，当你将一个回复字段预初始化为该数据类型的非默认值，并且执行 RPC 的服务器将该回复字段设置为默认值时，就会出现问题； 您会观察到写入似乎没有生效，并且在调用方，非默认值仍然存在。

 **无学分挑战练习**

实现您自己的 MapReduce 应用程序（参见 ```mrapps/*``` 中的示例），例如分布式 Grep（MapReduce 论文的第 2.3 节）。

让您的 MapReducecoordinator和 workers 在不同的机器上运行，就像他们在实践中那样。 您需要设置 RPC 以通过 TCP/IP 而不是 Unix 套接字进行通信（请参阅 ```Coordinator.server()``` 中注释掉的行），并使用共享文件系统读取/写入文件。 例如，您可以通过 ```ssh``` 连接到 MIT 的多个 [Athena 集群](http://kb.mit.edu/confluence/display/istcontrib/Getting+Started+with+Athena)机器，这些机器使用 [AFS](http://kb.mit.edu/confluence/display/istcontrib/AFS+at+MIT+-+An+Introduction) 共享文件； 或者您可以租用几个 AWS 实例并使用 [S3](https://aws.amazon.com/s3/) 进行存储。